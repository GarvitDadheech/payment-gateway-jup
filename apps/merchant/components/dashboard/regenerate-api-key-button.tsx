"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { regenerateApiKey } from "@/app/dashboard/api-key/actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RegenerateApiKeyButtonProps {
  merchantId: string;
}

export function RegenerateApiKeyButton({ merchantId }: RegenerateApiKeyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      await regenerateApiKey(merchantId);
      toast.success("API key regenerated successfully");
      // Force a refresh to show the new key
      window.location.reload();
    } catch (error) {
      console.error("Error regenerating API key:", error);
      toast.error("Failed to regenerate API key");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate API Key
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will invalidate your current API key. Any applications
            using this key will stop working until you update them with the new key.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            {isLoading ? "Regenerating..." : "Regenerate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 