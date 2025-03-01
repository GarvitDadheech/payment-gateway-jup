import { getServerSession } from "next-auth";
import prisma from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Overview } from "../../components/dashboard/overview";
import { RecentTransactions } from "../../components/dashboard/recent-transactions";
import { formatCurrency } from "../../lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession();
  console.log(session);
  if (!session?.user.email) {
    return <p> no user</p>;
  }
  
  const user = await prisma.merchant.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) {
    return null;
  }
  
  // Get transactions for this merchant
  const transactions = await prisma.transaction.findMany({
    where: { merchantId: user.merchant.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  
  // Calculate total payments received this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const thisMonthTransactions = await prisma.transaction.findMany({
    where: {
      merchantId: user.merchant.id,
      createdAt: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
  });
  
  const thisMonthTotal = thisMonthTransactions.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0
  );
  
  // Calculate total payments received last month
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const lastMonthTransactions = await prisma.transaction.findMany({
    where: {
      merchantId: user.merchant.id,
      createdAt: {
        gte: firstDayOfLastMonth,
        lte: lastDayOfLastMonth,
      },
    },
  });
  
  const lastMonthTotal = lastMonthTransactions.reduce(
    (acc, transaction) => acc + Number(transaction.amount),
    0
  );
  
  // Calculate percentage change
  const percentageChange = lastMonthTotal === 0
    ? 100
    : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  
  // Get transaction data for the chart
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();
  
  const chartData = await Promise.all(
    last30Days.map(async (date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dayTransactions = await prisma.transaction.findMany({
        where: {
          merchantId: user.merchant.id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      
      const total = dayTransactions.reduce(
        (acc, transaction) => acc + Number(transaction.amount),
        0
      );
      
      return {
        name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total,
      };
    })
  );
  
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Received (This Month)
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(thisMonthTotal)}</div>
                <p className="text-xs text-muted-foreground">
                  {percentageChange >= 0 ? "+" : ""}
                  {percentageChange.toFixed(2)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisMonthTransactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {thisMonthTransactions.length - lastMonthTransactions.length >= 0 ? "+" : ""}
                  {thisMonthTransactions.length - lastMonthTransactions.length} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {thisMonthTransactions.length > 0
                    ? formatCurrency(thisMonthTotal / thisMonthTransactions.length)
                    : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.merchant.token}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  Transaction volume for the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={chartData} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  You made {transactions.length} transactions recently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions transactions={transactions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics coming soon
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-muted-foreground">Analytics feature coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 