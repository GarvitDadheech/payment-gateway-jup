import { Transaction } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.fromWallet.slice(0, 6)}...{transaction.fromWallet.slice(-4)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.createdAt)}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +{formatCurrency(Number(transaction.amount))} {transaction.token}
          </div>
        </div>
      ))}
    </div>
  );
} 