import { notFound } from "next/navigation"
import prisma from "@repo/db"
import { CheckoutCard } from "@repo/ui/checkout-card"
import { WalletButton } from "../../components/wallet-button"
import { PaymentForm } from "./payment-form"
import { PaymentSection } from "./payment-section"

async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { merchant: true },
  })
  
  if (!session || session.status !== "pending") {
    return null
  }
  
  return session
}

export default async function CheckoutPage({ params }: { params: { sessionId: string } }) {
  //const session = await getSession(params.sessionId)
  
//   if (!session) {
//     notFound()
//   }
//for now hardcode the session
const session = {
  amount: 100,
  currency: "USDC",
  merchant: {
    name: "Acme Corp",
    address: "BvzKvn6nUUAYd3ZF2XHGN3u2PzBvqfv4BVtgHUb3rYaE" // Example Solana address
  },
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <CheckoutCard
          title="Complete Your Payment"
          description={`Pay ${session.amount} ${session.currency} to ${session.merchant.name}`}
        >
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-mono">
                  {session.amount} {session.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Merchant</span>
                <span className="text-white font-mono">
                  {session.merchant.name}
                </span>
              </div>
            </div>
            
            <PaymentSection 
              amount={session.amount}
              merchantAddress={session.merchant.address}
            />
          </div>
        </CheckoutCard>
      </div>
    </div>
  )
} 