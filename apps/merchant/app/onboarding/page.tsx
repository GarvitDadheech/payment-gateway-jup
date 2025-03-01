"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMerchant } from "./actions";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  wallet: z.string().min(32, { message: "Please enter a valid wallet address" }),
  token: z.string().min(1, { message: "Please select a token" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      wallet: "",
      token: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await createMerchant(data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating merchant:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-12">
      <div className="bg-background p-8 rounded-lg shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete Your Merchant Profile</h1>
          <p className="text-muted-foreground mt-2">Tell us about your business to get started</p>
        </div>
        
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
              "Complete Setup"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 