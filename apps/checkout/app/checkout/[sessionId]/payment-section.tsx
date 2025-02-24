"use client"

import { WalletButton } from "../../components/wallet-button"
import { PaymentForm } from "./payment-form"

interface PaymentSectionProps {
  amount: number
  merchantAddress: string
}

export function PaymentSection({ amount, merchantAddress }: PaymentSectionProps) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <WalletButton />
      <PaymentForm 
        amount={amount}
        merchantAddress={merchantAddress}
        onSuccess={() => {
          console.log("Payment successful!")
        }}
      />
    </div>
  )
} 