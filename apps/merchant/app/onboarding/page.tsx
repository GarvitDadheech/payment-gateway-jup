"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createMerchant, getMerchant } from "./actions";
import { useSession } from "next-auth/react";
import prisma from "@repo/db";

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
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [merchantWallet, setMerchantWallet] = useState("");
  if(!session?.user?.email) {
    router.push("/auth/login");
    return null;
  }
  useEffect(()=>{
    if(session.user.email){
      const fetchUser = async () => {
        console.log(session.user.email);
        const merchant = await getMerchant();
        setUser(merchant.user);
        setName(merchant.user.name);
      };
      fetchUser();
    }
  }, [session]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      createMerchant({
        name,
        wallet: merchantWallet,
        token: token,
      }).then((res) => {
        router.push("/dashboard");
      });
    } catch (error) {
      console.error("Error creating merchant:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-12">
      <div className="bg-background p-8 rounded-lg shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Hii! {user?.name} Complete Your Merchant Profile</h1>
          <p className="text-muted-foreground mt-2">Tell us about your business to get started</p>
        </div>
        
        <form onSubmit={()=> onSubmit()} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Merchant Name</Label>
            <Input
              id="name"
              placeholder="Your business name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wallet">Merchant Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="Your Solana wallet address"
              value={merchantWallet}
              onChange={(e) => setMerchantWallet(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token">Token Type for Payments</Label>
            <Select 
              value={token}
              onValueChange={(value) => setToken(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL">SOL</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
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