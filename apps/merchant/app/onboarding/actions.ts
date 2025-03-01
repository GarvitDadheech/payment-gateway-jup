"use server";

import { getServerSession } from "next-auth";
import prisma from "@repo/db";

import { redirect } from "next/navigation";
import { generateApiKey } from "../../lib/utils";

interface MerchantData {
  name: string;
  wallet: string;
  token: string;
}

export async function getMerchant(){
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }
  
  const user = await prisma.merchant.findUnique({
    where: { email: session.user.email }
  });
  
  return { user };
}

export async function createMerchant(data: MerchantData) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    throw new Error("You must be logged in to create a merchant account");
  }
  
  // Find the user
  const user = await prisma.merchant.update({
    where: { email: session.user.email },
    data: {
      name: data.name,
      wallet: data.wallet,
      token: data.token,
    }
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  if (user.wallet) {
    // User already has a merchant account, redirect to dashboard
    redirect("/dashboard");
  }
  
  // // Generate API key
  // const apiKey = generateApiKey();
  
  // // Create merchant
  // await prisma.merchant.create({
  //   data: {
  //     userId: user.id,
  //     name: data.name,
  //     description: data.description,
  //     wallet: data.wallet,
  //     token: data.token,
  //     apiKey,
  //   },
  // });
  return { success: true };
} 