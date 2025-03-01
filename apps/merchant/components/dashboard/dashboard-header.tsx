import { User, Merchant } from "@prisma/client";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";
import Link from "next/link";
import Image from "next/image";

interface DashboardHeaderProps {
  user: User;
  merchant: Merchant;
}

export function DashboardHeader({ user, merchant }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav merchant={merchant} />
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image 
              src="/logo.svg" 
              alt="CryptoPay Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8"
            />
            <span className="font-bold hidden md:inline-block">CryptoPay</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <UserNav user={user} merchant={merchant} />
        </div>
      </div>
    </header>
  );
} 