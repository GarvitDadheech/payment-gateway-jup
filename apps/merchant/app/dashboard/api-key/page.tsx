import { getServerSession } from "next-auth";
import prisma from "@repo/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiKeyDisplay } from "@/components/dashboard/api-key-display";
import { RegenerateApiKeyButton } from "@/components/dashboard/regenerate-api-key-button";

export default async function ApiKeyPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { merchant: true },
  });
  
  if (!user?.merchant) {
    return null;
  }
  
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">API Key</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your API Key</CardTitle>
          <CardDescription>
            Use this key to authenticate API requests from your application.
            Keep this key secret and never share it publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyDisplay apiKey={user.merchant.apiKey} />
        </CardContent>
        <CardFooter>
          <div className="space-y-2">
            <RegenerateApiKeyButton merchantId={user.merchant.id} />
            <p className="text-sm text-muted-foreground">
              Warning: Regenerating your API key will invalidate your previous key.
              Any applications using the old key will stop working.
            </p>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate CryptoPay into your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Endpoint</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <code className="bg-muted px-1 py-0.5 rounded">
                https://api.cryptopay.com/v1/payment
              </code>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Authentication</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Include your API key in the request headers:
            </p>
            <pre className="bg-muted p-2 rounded-md text-sm mt-2 overflow-x-auto">
              <code>
                {`Authorization: Bearer YOUR_API_KEY`}
              </code>
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Example Request</h3>
            <pre className="bg-muted p-2 rounded-md text-sm mt-2 overflow-x-auto">
              <code>
                {`fetch('https://api.cryptopay.com/v1/payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    amount: 10.50,
    token: 'USDC',
    metadata: {
      orderId: '12345',
      customerEmail: 'customer@example.com'
    }
  })
})`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 