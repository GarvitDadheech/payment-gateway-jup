"use server";

import prisma from "@repo/db";

import { revalidatePath } from "next/cache";
import { generateApiKey } from "../../../lib/utils";

export async function regenerateApiKey(merchantId: string) {
  // Generate a new API key
  const newApiKey = generateApiKey();
  
  // Update the merchant's API key
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { apiKey: newApiKey },
  });
  
  // Revalidate the API key page
  revalidatePath("/dashboard/api-key");
  
  return { success: true };
} 