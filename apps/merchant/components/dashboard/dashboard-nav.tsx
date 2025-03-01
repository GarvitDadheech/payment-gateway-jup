"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Merchant } from "@prisma/client";
import { 
  LayoutDashboard, 
  CreditCard, 
  Key, 
  Settings, 
  HelpCircle 
} from "lucide-react";

interface DashboardNavProps {
  merchant: Merchant;
}

export function DashboardNav({ merchant }: DashboardNavProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Transactions",
      href: "/dashboard/transactions",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      title: "API Key",
      href: "/dashboard/api-key",
      icon: <Key className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Help & Support",
      href: "/dashboard/support",
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
    },
  ];
  
  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
} 