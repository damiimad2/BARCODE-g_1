import React, { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import BarcodeScanner from "./BarcodeScanner";
import { authenticateWithBarcode } from "../lib/auth";

interface LoginProps {
  onLogin: (user: any) => void;
  onRegister: () => void;
}

const Login = ({ onLogin, onRegister }: LoginProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleBarcodeScan = async (
    barcodeData: string,
    customerExists: boolean,
  ) => {
    if (customerExists) {
      const { user, error } = await authenticateWithBarcode(barcodeData);
      if (user) {
        onLogin(user);
      } else {
        setError(error || "Authentication failed");
      }
    } else {
      setError("No account found with this barcode. Please register first.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Perfume Loyalty</CardTitle>
          <CardDescription>
            Log in with your barcode to access your loyalty account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan Barcode</TabsTrigger>
              <TabsTrigger value="register">New Customer</TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="mt-4">
              <BarcodeScanner
                onScan={handleBarcodeScan}
                isAuthMode={true}
                error={error}
              />
            </TabsContent>
            <TabsContent value="register" className="mt-4">
              <div className="text-center py-8 space-y-4">
                <UserPlus className="h-12 w-12 mx-auto text-primary opacity-80" />
                <h3 className="text-lg font-medium">
                  New to our loyalty program?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Register now to start earning points with every purchase
                </p>
                <Button onClick={onRegister} className="w-full mt-2">
                  Register New Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Loyalty program by Perfume Shop
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
