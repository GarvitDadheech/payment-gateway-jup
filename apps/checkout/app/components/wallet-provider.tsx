"use client"

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo, useState } from "react"

// Import styles in a client component
import "@solana/wallet-adapter-react-ui/styles.css"

export function WalletProviders({ children }: { children: React.ReactNode }) {
  // Use Devnet
  const network = WalletAdapterNetwork.Mainnet
  const [endpoint, setEndpoint] = useState(process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(network));
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
} 