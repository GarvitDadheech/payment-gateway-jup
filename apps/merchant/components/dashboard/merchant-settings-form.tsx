"use client";

import { useState } from "react";
import { Merchant } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMerchantSettings } from "@/app/dashboard/settings/actions";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  wallet: z.string().min(32, { message: "Please enter a valid wallet address" }),
  token: z.string().min(1, { message: "Please select a token" }),
});

type FormValues = z.infer<typeof formSchema>;

interface MerchantSettingsFormProps {
  merchant: Merchant;
}

export function MerchantSettingsForm({ merchant }: MerchantSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: merchant.name,
      description: merchant.description,
      wallet: merchant.wallet,
      token: merchant.token,
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await updateMerchantSettings(merchant.id, data);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Merchant Name</Label>
        <Input
          id="name"
          placeholder="Your business name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">What does your company do?</Label>
        <Textarea
          id="description"
          placeholder="Briefly describe your business and what you sell"
          {...register("description")}
          className="min-h-[100px]"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wallet">Merchant Wallet Address</Label>
        <Input
          id="wallet"
          placeholder="Your Solana wallet address"
          {...register("wallet")}
        />
        {errors.wallet && (
          <p className="text-sm text-destructive">{errors.wallet.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="token">Token Type for Payments</Label>
        <Select 
          defaultValue={merchant.token}
          onValueChange={(value) => setValue("token", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOL">SOL</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="BOTH">Both SOL & USDC</SelectItem>
          </SelectContent>
        </Select>
        {errors.token && (
          <p className="text-sm text-destructive">{errors.token.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
} 