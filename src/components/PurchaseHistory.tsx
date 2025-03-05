import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Loader2, Download } from "lucide-react";
import { Button } from "./ui/button";
import { getCustomerPurchases } from "../lib/api";

interface Purchase {
  id: string;
  date: Date;
  amount: number;
  pointsEarned: number;
  discountApplied: number | null;
}

interface PurchaseHistoryProps {
  purchases?: Purchase[];
  customerId?: string;
}

const PurchaseHistory = ({
  purchases: initialPurchases,
  customerId = "12345",
}: PurchaseHistoryProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If purchases were passed as props, use those
    if (initialPurchases && initialPurchases.length > 0) {
      setPurchases(initialPurchases);
      return;
    }

    // Otherwise fetch from the API
    const fetchPurchases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCustomerPurchases(customerId);
        const formattedPurchases = data.map((purchase) => ({
          id: purchase.id,
          date: new Date(purchase.created_at),
          amount: purchase.amount,
          pointsEarned: purchase.points_earned,
          discountApplied: purchase.discount_applied,
        }));
        setPurchases(formattedPurchases);
      } catch (err) {
        console.error("Error fetching purchase history:", err);
        setError("Failed to load purchase history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [customerId, initialPurchases]);

  const handleExportCSV = () => {
    if (purchases.length === 0) return;

    // Create CSV content
    const headers = ["Date", "Amount", "Points Earned", "Discount Applied"];
    const csvRows = [
      headers.join(","),
      ...purchases.map((purchase) =>
        [
          format(purchase.date, "yyyy-MM-dd"),
          purchase.amount.toFixed(2),
          purchase.pointsEarned,
          purchase.discountApplied ? purchase.discountApplied.toFixed(2) : "0",
        ].join(","),
      ),
    ];
    const csvContent = csvRows.join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `purchase_history_${customerId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-md shadow p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-md shadow p-4">
        <h3 className="text-lg font-medium mb-4">Purchase History</h3>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Purchase History</h3>
        {purchases.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Table>
        <TableCaption>Purchase history for customer #{customerId}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Purchase Amount</TableHead>
            <TableHead>Points Earned</TableHead>
            <TableHead>Discount Applied</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.length > 0 ? (
            purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{format(purchase.date, "MMM d, yyyy")}</TableCell>
                <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    +{purchase.pointsEarned} pts
                  </Badge>
                </TableCell>
                <TableCell>
                  {purchase.discountApplied ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      ${purchase.discountApplied.toFixed(2)}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">None</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No purchase history available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseHistory;
