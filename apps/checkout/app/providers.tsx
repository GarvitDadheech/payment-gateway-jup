"use client"

import './buffer-polyfill'
import { WalletProviders } from "./components/wallet-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>
} 