import { getServerSession } from "next-auth";
import prisma from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { page?: string; token?: string; sort?: string; order?: string };
}) {
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
  
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  
  // Build the where clause for filtering
  const where = {
    merchantId: user.merchant.id,
    ...(searchParams.token ? { token: searchParams.token } : {}),
  };
  
  // Build the orderBy clause for sorting
  const orderBy = searchParams.sort
    ? {
        [searchParams.sort]: searchParams.order === "desc" ? "desc" : "asc",
      }
    : { createdAt: "desc" };
  
  // Get transactions with pagination
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
  });
  
  // Get total count for pagination
  const totalCount = await prisma.transaction.count({ where });
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Get unique tokens for filtering
  const uniqueTokens = await prisma.transaction.findMany({
    where: { merchantId: user.merchant.id },
    select: { token: true },
    distinct: ["token"],
  });
  
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your transaction history and filter by token type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={transactions}
            currentPage={page}
            totalPages={totalPages}
            tokens={uniqueTokens.map((t) => t.token)}
            currentToken={searchParams.token}
            currentSort={searchParams.sort}
            currentOrder={searchParams.order}
          />
        </CardContent>
      </Card>
    </div>
  );
} 