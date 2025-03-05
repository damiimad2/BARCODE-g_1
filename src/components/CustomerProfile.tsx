import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Gift, History, User, Edit, Loader2, Save } from "lucide-react";
import PurchaseHistory from "./PurchaseHistory";
import { getCustomerPurchases, updateCustomer } from "../lib/api";

interface Discount {
  id: string;
  amount: number;
  expiryDate: Date;
  isUsed: boolean;
}

interface Purchase {
  id: string;
  date: Date;
  amount: number;
  pointsEarned: number;
  discountApplied: number | null;
}

interface CustomerProfileProps {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    joinDate: Date;
    pointsBalance: number;
    totalSpent: number;
    avatarUrl?: string;
  };
  discounts?: Discount[];
}

const CustomerProfile = ({
  customer = {
    id: "12345",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    joinDate: new Date(2023, 0, 15),
    pointsBalance: 450,
    totalSpent: 1250.75,
    avatarUrl: "",
  },
  discounts = [
    {
      id: "disc-1",
      amount: 10,
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isUsed: false,
    },
    {
      id: "disc-2",
      amount: 25,
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      isUsed: false,
    },
  ],
}: CustomerProfileProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPurchases = async () => {
      setIsLoading(true);
      try {
        const customerPurchases = await getCustomerPurchases(customer.id);
        setPurchases(
          customerPurchases.map((p) => ({
            id: p.id,
            date: new Date(p.created_at),
            amount: p.amount,
            pointsEarned: p.points_earned,
            discountApplied: p.discount_applied,
          })),
        );
      } catch (err) {
        console.error("Error loading purchases:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, [customer.id]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Customer Info Card */}
        <Card className="flex-1 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">
              Customer Profile
            </CardTitle>
            <div className="text-xs text-green-600 font-medium">
              Auto-save enabled
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    customer.avatarUrl ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
                  }
                  alt={customer.name}
                />
                <AvatarFallback>
                  {customer.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <Input
                    className="text-lg font-medium h-8 py-1"
                    defaultValue={customer.name}
                    onChange={(e) => {
                      customer.name = e.target.value;
                      // Auto-save changes
                      updateCustomer(customer.id, { name: e.target.value });
                    }}
                  />
                  <div
                    className="text-xs text-green-600 opacity-0 transition-opacity duration-300"
                    id="save-indicator"
                  >
                    Saved
                  </div>
                  <script>
                    {`
                    // Show save indicator briefly when input changes
                    document.querySelector('input').addEventListener('change', () => {
                      const indicator = document.getElementById('save-indicator');
                      indicator.style.opacity = '1';
                      setTimeout(() => {
                        indicator.style.opacity = '0';
                      }, 2000);
                    });
                    `}
                  </script>
                </div>
                <p className="text-sm font-mono text-gray-700 mt-1">
                  Barcode Registration: {customer.barcode || customer.id}
                </p>
                <p className="text-sm text-gray-500">
                  Customer since {customer.joinDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-20">Email:</span>
                <Input
                  className="flex-1"
                  placeholder="Enter email address"
                  defaultValue={customer.email}
                  onChange={(e) => {
                    customer.email = e.target.value;
                    // Auto-save changes
                    updateCustomer(customer.id, { email: e.target.value });
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-20">Phone:</span>
                <Input
                  className="flex-1"
                  placeholder="Enter phone number"
                  defaultValue={customer.phone}
                  onChange={(e) => {
                    customer.phone = e.target.value;
                    // Auto-save changes
                    updateCustomer(customer.id, { phone: e.target.value });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points & Discounts Card */}
        <Card className="flex-1 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Loyalty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Points Balance
                </span>
                <Badge
                  variant="secondary"
                  className="text-lg px-3 py-1 bg-purple-100 text-purple-800"
                >
                  {customer.pointsBalance} pts
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  Total Spent
                </span>
                <span className="font-medium">
                  ${customer.totalSpent.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4" /> Available Discounts
              </h4>
              {discounts.length > 0 ? (
                <div className="space-y-2">
                  {discounts.map((discount) => (
                    <div
                      key={discount.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <span className="font-medium text-green-600">
                          ${discount.amount.toFixed(2)} Off
                        </span>
                        <p className="text-xs text-gray-500">
                          Expires: {discount.expiryDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8">
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No discounts available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Purchase History and other potential sections */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases" className="flex items-center gap-1">
            <History className="h-4 w-4" /> Purchase History
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1">
            <User className="h-4 w-4" /> Preferences
          </TabsTrigger>
        </TabsList>
        <TabsContent value="purchases">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PurchaseHistory
              customerId={customer.id}
              purchases={purchases.length > 0 ? purchases : undefined}
            />
          )}
        </TabsContent>
        <TabsContent value="preferences">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <p className="text-gray-500">
                Customer preferences and settings will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;
