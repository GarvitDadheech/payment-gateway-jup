"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyDisplayProps {
  apiKey: string;
}

export function ApiKeyDisplay({ apiKey }: ApiKeyDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard");
  };
  
  const maskedApiKey = apiKey.substring(0, 4) + "•".repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          value={isVisible ? apiKey : maskedApiKey}
          readOnly
          className="font-mono"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={toggleVisibility}
          title={isVisible ? "Hide API key" : "Show API key"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={copyToClipboard}
          title="Copy API key"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 