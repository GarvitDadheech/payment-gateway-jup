"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useCallback, useState } from "react"
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Button } from "@repo/ui/button"
import { Buffer } from "buffer"
import { TokenSelector } from "../../components/token-selector"
import { SUPPORTED_TOKENS, Token } from "../../config/tokens"
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} from "@solana/spl-token"

interface PaymentFormProps {
  amount: number
  merchantAddress: string
  onSuccess: () => void
}

// Using USDC mint address for merchant payment
const MERCHANT_TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


const DEFAULT_TOKEN: Token = {
  symbol: "SOL",
  name: "Solana",
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
}

export function PaymentForm({ amount, merchantAddress, onSuccess }: PaymentFormProps) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token>(DEFAULT_TOKEN)
  const handlePayment = useCallback(async () => {
    if (!publicKey) {
      alert("Please connect your wallet first!")
      return
    }
    
    setLoading(true)
    try {
      // Convert to USDC decimal units (6 decimals)
      const usdcAmountInSmallestUnits = Math.floor(amount * Math.pow(10, 6))
      
      // Check if the selected token is already USDC (same as merchant token)
      const isDirectTransfer = selectedToken.mint.toLowerCase() === MERCHANT_TOKEN.toLowerCase()
      
      // Get merchant's public key and token account
      const merchantPubKey = new PublicKey(merchantAddress)
      const merchantTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(MERCHANT_TOKEN),
        merchantPubKey
      )
      
      // Check if merchant token account exists
      let merchantAccountExists = true
      try {
        await getAccount(connection, merchantTokenAccount)
      } catch (error) {
        merchantAccountExists = false
      }
      
      // Create a new transaction
      const transaction = new Transaction()
      
      // If merchant account doesn't exist, add instruction to create it
      if (!merchantAccountExists) {
        console.log("Creating merchant token account")
        const createAtaIx = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          merchantTokenAccount, // ata
          merchantPubKey, // owner
          new PublicKey(MERCHANT_TOKEN) // mint
        )
        transaction.add(createAtaIx)
      }
      
      if (isDirectTransfer) {
        // Direct USDC transfer (no swap needed)
        console.log("Performing direct USDC transfer")
        
        // Get user's USDC token account
        const userTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(MERCHANT_TOKEN),
          publicKey
        )
        
        // Add transfer instruction
        const transferIx = createTransferInstruction(
          userTokenAccount,
          merchantTokenAccount,
          publicKey,
          usdcAmountInSmallestUnits
        )
        
        transaction.add(transferIx)
        
        // Ask for confirmation
        const proceed = window.confirm(
          `You will transfer:\n${amount.toFixed(2)} USDC\n\nTo merchant address:\n${merchantAddress}\n\nProceed with transaction?`
        )
        
        if (!proceed) {
          throw new Error("Transaction cancelled by user")
        }
      } else {
        // Swap and transfer flow
        // 1. Get quote from Jupiter
        const quoteApi = `https://quote-api.jup.ag/v6/quote?inputMint=${selectedToken.mint}&outputMint=${MERCHANT_TOKEN}&amount=${usdcAmountInSmallestUnits}&slippageBps=50&swapMode=ExactOut`
        console.log("Fetching quote from:", quoteApi)
  
        const quoteResponse = await (await fetch(quoteApi)).json()
        console.log("Quote response:", quoteResponse)
  
        if (quoteResponse.error) {
          throw new Error(`Quote error: ${quoteResponse.error}`)
        }
  
        // Show quote details to user
        const inputAmount = quoteResponse.inAmount / Math.pow(10, selectedToken.decimals)
        const outputAmount = quoteResponse.outAmount / Math.pow(10, 6) // USDC has 6 decimals
        const priceImpact = quoteResponse.priceImpactPct
        
        const proceed = window.confirm(
          `You will pay:\n${inputAmount.toFixed(4)} ${selectedToken.symbol}\n\nMerchant receives:\n${outputAmount.toFixed(2)} USDC\n\nPrice Impact: ${(priceImpact * 100).toFixed(2)}%\n\nProceed with transaction?`
        )
  
        if (!proceed) {
          throw new Error("Transaction cancelled by user")
        }
  
        // 3. Set up the swap with direct merchant deposit
        const swapRequestBody = {
          quoteResponse,
          userPublicKey: publicKey.toString(),
          destinationTokenAccount: merchantTokenAccount.toString(),
          wrapUnwrapSOL: true,
          computeUnitPriceMicroLamports: 100,
          asLegacyTransaction: true
        }
  
        console.log("Sending swap request:", swapRequestBody)
  
      const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(swapRequestBody)
        })
  
        if (!swapResponse.ok) {
          const errorText = await swapResponse.text()
          throw new Error(`Swap API error: ${errorText}`)
        }
  
        const { swapTransaction } = await swapResponse.json()
        
        if (!swapTransaction) {
          throw new Error("No swap transaction returned from Jupiter")
        }
  
        // 4. Deserialize the transaction and merge with our transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
        const jupiterTransaction = Transaction.from(swapTransactionBuf)
        
        // Add all instructions from Jupiter transaction to our transaction
        jupiterTransaction.instructions.forEach(instruction => {
          transaction.add(instruction)
        })
      }
  
      // Add recent blockhash and fee payer
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
  
      // Send the transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 3
      })
      
      console.log("Transaction sent! Signature:", signature)
      console.log("View in Explorer:", `https://solscan.io/tx/${signature}`)
  
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      })
  
      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm")
      }
  
      console.log("Transaction confirmed!", confirmation)
      onSuccess()
    } catch (error) {
      console.error("Payment failed:", error)
      alert("Payment failed: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, amount, selectedToken, merchantAddress, onSuccess])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Pay with:</span>
        <TokenSelector 
          selectedToken={selectedToken}
          onSelect={setSelectedToken}
        />
      </div>
      
      <Button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium"
      >
        {loading ? "Processing Payment..." : `Pay $${amount} in ${selectedToken.symbol}`}
      </Button>
    </div>
  )
}