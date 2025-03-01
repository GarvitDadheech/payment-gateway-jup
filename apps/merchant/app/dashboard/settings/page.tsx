import { getServerSession } from "next-auth";
import prisma from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantSettingsForm } from "@/components/dashboard/merchant-settings-form";

export default async function SettingsPage() {
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
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Merchant Settings</CardTitle>
          <CardDescription>
            Update your merchant profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MerchantSettingsForm merchant={user.merchant} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Account settings coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 