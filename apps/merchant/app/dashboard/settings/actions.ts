"use server";

import prisma from "@repo/db";
import { revalidatePath } from "next/cache";

interface MerchantSettingsData {
  name: string;
  description: string;
  wallet: string;
  token: string;
}

export async function updateMerchantSettings(merchantId: string, data: MerchantSettingsData) {
  // Update the merchant's settings
  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      name: data.name,
      description: data.description,
      wallet: data.wallet,
      token: data.token,
    },
  });
  
  // Revalidate the settings page
  revalidatePath("/dashboard/settings");
  
  return { success: true };
} 