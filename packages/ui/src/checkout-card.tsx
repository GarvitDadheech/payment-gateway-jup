import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

interface CheckoutCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function CheckoutCard({ title, description, children, footer }: CheckoutCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-black/30 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
} 