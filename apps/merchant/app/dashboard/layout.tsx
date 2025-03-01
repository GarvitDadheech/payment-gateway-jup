import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@repo/db";
import { DashboardNav } from "../../components/dashboard/dashboard-nav";
import { DashboardHeader } from "../../components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }
  
  // Check if user has completed onboarding
  const user = await prisma.merchant.findUnique({
    where: { email: session.user.email }
  });
  
  if (!user?.wallet) {
    redirect("/onboarding");
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} merchant={user.merchant} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav merchant={user.merchant} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
} 