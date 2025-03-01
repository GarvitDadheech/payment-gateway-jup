"use server";

import { getServerSession } from "next-auth";
import prisma from "@repo/db";

import { redirect } from "next/navigation";
import { generateApiKey } from "../../lib/utils";

interface MerchantData {
  name: string;
  description: string;
  wallet: string;
  token: string;
}

export async function createMerchant(data: MerchantData) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    throw new Error("You must be logged in to create a merchant account");
  }
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { merchant: true },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (user.merchant) {
    // User already has a merchant account, redirect to dashboard
    redirect("/dashboard");
  }
  
  // Generate API key
  const apiKey = generateApiKey();
  
  // Create merchant
  await prisma.merchant.create({
    data: {
      userId: user.id,
      name: data.name,
      description: data.description,
      wallet: data.wallet,
      token: data.token,
      apiKey,
    },
  });
  
  return { success: true };
} 