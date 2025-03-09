import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Store, Lock, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "../lib/supabase";

interface StoreOwnerLoginProps {
  onLogin: (storeOwner: any) => void;
  onAdminClick: () => void;
}

const StoreOwnerLogin = ({ onLogin, onAdminClick }: StoreOwnerLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check if the store owner exists with the provided credentials
      const { data, error } = await supabase
        .from("store_owners")
        .select("*")
        .eq("email", email)
        .eq("password", password) // In a real app, this would use proper password hashing
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setError("Invalid email or password");
        return;
      }

      // Store store owner authentication in localStorage
      localStorage.setItem("storeOwnerAuthenticated", "true");
      localStorage.setItem("storeOwner", JSON.stringify(data));

      // Call the onLogin callback with the store owner data
      onLogin(data);
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Store Owner Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your loyalty program dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login to Dashboard"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">For store owners only</p>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            onClick={onAdminClick}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StoreOwnerLogin;
