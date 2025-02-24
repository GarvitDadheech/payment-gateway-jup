"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useCallback, useState } from "react"
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Button } from "@repo/ui/button"
import { Buffer } from "buffer"
import { TokenSelector } from "../../components/token-selector"
import { SUPPORTED_TOKENS, Token, DEFAULT_TOKEN } from "../../config/tokens"

interface PaymentFormProps {
  amount: number
  merchantAddress: string
  onSuccess: () => void
}

// Using Devnet USDC mint address for merchant payment
const MERCHANT_TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

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
      // 1. Get quote from Jupiter
      const quoteApi = `https://quote-api.jup.ag/v6/quote?inputMint=${selectedToken.mint}&outputMint=${MERCHANT_TOKEN}&amount=${amount * Math.pow(10, selectedToken.decimals)}&slippageBps=50`
      console.log("Fetching quote from:", quoteApi)

      const quoteResponse = await (await fetch(quoteApi)).json()
      console.log("Quote response:", quoteResponse)

      if (quoteResponse.error) {
        throw new Error(`Quote error: ${quoteResponse.error}`)
      }

      // Show quote details to user
      const inputAmount = amount
      const outputAmount = quoteResponse.outAmount / Math.pow(10, 6) // USDC has 6 decimals
      const priceImpact = quoteResponse.priceImpactPct
      
      const proceed = window.confirm(
        `You will pay:\n${inputAmount} ${selectedToken.symbol}\n\nMerchant receives:\n${outputAmount.toFixed(2)} USDC\n\nPrice Impact: ${(priceImpact * 100).toFixed(2)}%\n\nProceed with transaction?`
      )

      if (!proceed) {
        throw new Error("Transaction cancelled by user")
      }

      // Convert amount to lamports (Jupiter expects amounts in smallest units)
      const inputAmountInLamports = amount * Math.pow(10, selectedToken.decimals)

      // 2. Get serialized transactions for the swap
      const swapRequestBody = {
        quoteResponse,
        userPublicKey: publicKey.toString(),
        wrapUnwrapSOL: true,
        // Use lower compute unit price for devnet
        computeUnitPriceMicroLamports: 100,
        asLegacyTransaction: true
      }

      console.log("Sending swap request:", swapRequestBody)

      const swapResponse = await fetch('https://api.jup.ag/v6/swap', {
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

      const swapData = await swapResponse.json()
      console.log("Swap response:", swapData)

      if (!swapData.swapTransaction) {
        throw new Error("No swap transaction returned from Jupiter")
      }

      // 3. Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64')
      const transaction = Transaction.from(swapTransactionBuf)

      // 4. Add recent blockhash and fee payer
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // 5. Send the transaction to the network
      // This will trigger the wallet popup for user to confirm
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 3
      })
      
      console.log("Transaction sent! Signature:", signature)
      console.log("View in Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`)

      // 6. Wait for confirmation
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
  }, [publicKey, connection, amount, selectedToken, onSuccess])

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
        {loading ? "Processing Payment..." : `Pay ${amount} ${selectedToken.symbol}`}
      </Button>
    </div>
  )
} 