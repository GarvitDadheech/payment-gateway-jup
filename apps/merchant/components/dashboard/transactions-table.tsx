"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Transaction } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  tokens: string[];
  currentToken?: string;
  currentSort?: string;
  currentOrder?: string;
}

export function TransactionsTable({
  transactions,
  currentPage,
  totalPages,
  tokens,
  currentToken,
  currentSort,
  currentOrder,
}: TransactionsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const createQueryString = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    
    return newSearchParams.toString();
  };
  
  const handleSort = (column: string) => {
    const isAsc = currentSort === column && currentOrder === "asc";
    
    router.push(
      `${pathname}?${createQueryString({
        sort: column,
        order: isAsc ? "desc" : "asc",
      })}`
    );
  };
  
  const handleTokenChange = (token: string) => {
    router.push(
      `${pathname}?${createQueryString({
        token: token === "all" ? "" : token,
        page: "1", // Reset to first page when filtering
      })}`
    );
  };
  
  const handlePageChange = (page: number) => {
    router.push(
      `${pathname}?${createQueryString({
        page: page.toString(),
      })}`
    );
  };
  
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground mb-4">No transactions found</p>
        {currentToken && (
          <Button variant="outline" onClick={() => handleTokenChange("all")}>
            Clear Filter
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Filter by token:</span>
          <Select
            value={currentToken || "all"}
            onValueChange={handleTokenChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              {tokens.map((token) => (
                <SelectItem key={token} value={token}>
                  {token}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("fromWallet")}
              >
                <div className="flex items-center space-x-1">
                  <span>From</span>
                  {currentSort === "fromWallet" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("toWallet")}
              >
                <div className="flex items-center space-x-1">
                  <span>To</span>
                  {currentSort === "toWallet" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  {currentSort === "amount" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("token")}
              >
                <div className="flex items-center space-x-1">
                  <span>Token</span>
                  {currentSort === "token" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {currentSort === "createdAt" && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.fromWallet.slice(0, 6)}...{transaction.fromWallet.slice(-4)}
                </TableCell>
                <TableCell>
                  {transaction.toWallet.slice(0, 6)}...{transaction.toWallet.slice(-4)}
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(transaction.amount))}
                </TableCell>
                <TableCell>{transaction.token}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 