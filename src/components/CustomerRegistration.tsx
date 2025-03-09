import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Barcode, Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { createCustomer, generateBarcode } from "../lib/api";
import {
  authenticateWithBarcode,
  getAuthenticatedStoreOwner,
} from "../lib/auth";

// Form validation schema - only barcode is required
const formSchema = z.object({
  barcode: z.string().min(1, { message: "Barcode is required" }),
});

interface CustomerRegistrationProps {
  onRegister?: (data: any) => void;
  isOpen?: boolean;
  initialBarcode?: string | null;
  onLogin?: (user: any) => void;
}

const CustomerRegistration = ({
  onRegister = (data) => console.log("Customer registered:", data),
  isOpen = true,
  initialBarcode = null,
  onLogin,
}: CustomerRegistrationProps) => {
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const [customerBarcode, setCustomerBarcode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barcode: initialBarcode || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Use the barcode from the form
      const barcode = data.barcode || generateBarcode();

      // Generate a default name based on barcode
      const customerName = `Customer ${barcode.substring(2, 6)}`;

      // Get the authenticated store owner if available
      const storeOwner = getAuthenticatedStoreOwner();

      // Create customer in database with minimal required info
      // Give 10 points for registration
      const customerData = {
        name: customerName,
        email: null,
        phone: null,
        address: null,
        points_balance: 10, // Start with 10 points for registration
        total_spent: 0,
        barcode: barcode,
        birthdate: null,
      };

      const newCustomer = await createCustomer(
        customerData,
        storeOwner ? storeOwner.id : undefined,
      );

      if (newCustomer) {
        setCustomerBarcode(barcode);
        setBarcodeGenerated(true);

        // Call the onRegister callback with the customer data
        onRegister(newCustomer);

        // We don't need to auto-login customers anymore
        // Just show the barcode and stay in the store owner's account
      } else {
        setError("Failed to register customer. Please try again.");
      }
    } catch (err) {
      console.error("Error registering customer:", err);
      setError("An error occurred while registering the customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      {!barcodeGenerated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              New Customer Registration
            </CardTitle>
            <CardDescription>
              Register a new customer to the loyalty program by scanning their
              barcode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Scan or enter barcode"
                          {...field}
                          value={initialBarcode || field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Scan the barcode to register a new customer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Customer"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              Customer Registered Successfully
            </CardTitle>
            <CardDescription>
              The customer has been registered to the loyalty program. Please
              provide them with their unique barcode.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-gray-100 p-6 rounded-lg mb-4 w-full max-w-md mx-auto text-center">
              <p className="text-sm text-gray-500 mb-2">Customer Barcode</p>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
                {/* This would be replaced with an actual barcode component in production */}
                <div className="h-16 bg-gray-800 w-full mb-2 flex items-center justify-center">
                  <div className="flex space-x-1">
                    {customerBarcode.split("").map((char, index) => (
                      <div
                        key={index}
                        className={`h-16 w-1 ${index % 2 === 0 ? "bg-white" : "bg-transparent"}`}
                      ></div>
                    ))}
                  </div>
                </div>
                <p className="text-lg font-mono font-bold">{customerBarcode}</p>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Initial points balance:{" "}
                <span className="font-bold">10 points</span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setBarcodeGenerated(false);
                form.reset();
              }}
              className="mr-2"
            >
              Register Another Customer
            </Button>
            <Button
              onClick={() => {
                // In a real app, this would print the barcode
                alert("Printing barcode: " + customerBarcode);
              }}
            >
              Print Barcode
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CustomerRegistration;
