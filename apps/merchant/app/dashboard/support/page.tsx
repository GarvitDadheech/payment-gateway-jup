import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about CryptoPay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I integrate CryptoPay into my website?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  You can integrate CryptoPay using our JavaScript SDK or REST API. Visit the API Key page for documentation and examples.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What cryptocurrencies do you support?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  We currently support SOL and USDC on the Solana blockchain. More tokens will be added in the future.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How much does it cost to use CryptoPay?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  CryptoPay charges 0% platform fees. You only pay the network gas fees for transactions on the Solana blockchain, which are typically less than $0.01.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I withdraw my funds?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  Payments are sent directly to your wallet address. There's no need to withdraw funds from CryptoPay.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Is there a minimum payment amount?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">
                  There is no minimum payment amount set by CryptoPay. However, very small transactions may not be economical due to network fees.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Need more help? Get in touch with our support team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Email Support</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send us an email at <a href="mailto:support@cryptopay.com" className="text-primary hover:underline">support@cryptopay.com</a>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Discord Community</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Join our Discord community for real-time support and to connect with other merchants.
            </p>
            <a href="https://discord.gg/cryptopay" target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
              <Button variant="outline">Join Discord</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 