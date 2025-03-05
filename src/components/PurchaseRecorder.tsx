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
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { CreditCard, Loader2, Percent, Plus, Receipt } from "lucide-react";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { recordPurchase } from "../lib/api";

interface Discount {
  id: string;
  value: number;
  description: string;
}

interface PurchaseRecorderProps {
  customerId?: string;
  customerName?: string;
  currentPoints?: number;
  availableDiscounts?: Discount[];
  onPurchaseComplete?: (purchaseData: {
    amount: number;
    pointsEarned: number;
    discountApplied: number | null;
  }) => void;
}

const PurchaseRecorder = ({
  customerId = "12345",
  customerName = "Jane Smith",
  currentPoints = 450,
  availableDiscounts = [
    { id: "1", value: 10, description: "$10 off purchase" },
    { id: "2", value: 25, description: "$25 off purchase" },
    { id: "3", value: 50, description: "$50 off purchase" },
  ],
  onPurchaseComplete = () => {},
}: PurchaseRecorderProps) => {
  const [purchaseAmount, setPurchaseAmount] = useState<string>("");
  const [selectedDiscount, setSelectedDiscount] =
    useState<string>("no_discount");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [purchaseComplete, setPurchaseComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate points (1 point per $2 spent, rounded to nearest whole number)
  const calculatePoints = (amount: number): number => {
    return Math.round(amount / 2);
  };

  // Get discount amount based on selected discount
  const getDiscountAmount = (): number => {
    if (!selectedDiscount || selectedDiscount === "no_discount") return 0;
    const discount = availableDiscounts.find((d) => d.id === selectedDiscount);
    return discount ? discount.value : 0;
  };

  // Calculate final amount after discount
  const calculateFinalAmount = (): number => {
    const amount = parseFloat(purchaseAmount) || 0;
    const discountAmount = getDiscountAmount();
    return Math.max(0, amount - discountAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const amount = parseFloat(purchaseAmount) || 0;
      const discountAmount = getDiscountAmount();
      const finalAmount = calculateFinalAmount();
      const pointsEarned = calculatePoints(finalAmount);

      // Record purchase in database
      const purchaseData = {
        customer_id: customerId,
        amount: finalAmount,
        points_earned: pointsEarned,
        discount_applied: discountAmount > 0 ? discountAmount : null,
      };

      const result = await recordPurchase(purchaseData);

      if (result) {
        onPurchaseComplete({
          amount: finalAmount,
          pointsEarned,
          discountApplied: discountAmount > 0 ? discountAmount : null,
        });

        setPurchaseComplete(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setPurchaseAmount("");
          setSelectedDiscount("no_discount");
          setPurchaseComplete(false);
        }, 3000);
      } else {
        setError("Failed to record purchase. Please try again.");
      }
    } catch (err) {
      console.error("Error recording purchase:", err);
      setError("An error occurred while recording the purchase.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Record Purchase
          </CardTitle>
          <CardDescription>
            Record a new purchase for customer {customerName}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Customer info summary */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-lg font-semibold">{customerName}</p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {currentPoints} points available
                </Badge>
              </div>

              {/* Purchase amount */}
              <div className="space-y-2">
                <Label htmlFor="purchaseAmount" className="text-base">
                  Purchase Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="purchaseAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Available discounts */}
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-base">
                  Apply Discount
                </Label>
                <Select
                  value={selectedDiscount}
                  onValueChange={setSelectedDiscount}
                  disabled={isProcessing}
                >
                  <SelectTrigger id="discount">
                    <SelectValue placeholder="Select a discount to apply" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_discount">No discount</SelectItem>
                    {availableDiscounts.map((discount) => (
                      <SelectItem key={discount.id} value={discount.id}>
                        {discount.description} (${discount.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calculation summary */}
              {purchaseAmount && (
                <div className="bg-slate-50 p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Purchase Amount:</span>
                    <span>${parseFloat(purchaseAmount).toFixed(2)}</span>
                  </div>

                  {selectedDiscount && selectedDiscount !== "no_discount" && (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="text-sm flex items-center gap-1">
                        <Percent className="h-4 w-4" /> Discount Applied:
                      </span>
                      <span>-${getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center font-medium">
                    <span>Final Amount:</span>
                    <span>${calculateFinalAmount().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Points to be earned:
                    </span>
                    <span>+{calculatePoints(calculateFinalAmount())} pts</span>
                  </div>

                  <div className="flex justify-between items-center font-medium mt-2 pt-2 border-t border-gray-200">
                    <span>Total points after purchase:</span>
                    <span className="text-green-600 font-bold">
                      {currentPoints + calculatePoints(calculateFinalAmount())}{" "}
                      pts
                    </span>
                  </div>
                </div>
              )}

              {purchaseComplete && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription className="flex items-center justify-center py-1">
                    Purchase successfully recorded!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            type="button"
            disabled={isProcessing}
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!purchaseAmount || isProcessing || purchaseComplete}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Record Purchase
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseRecorder;
