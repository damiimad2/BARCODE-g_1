import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Award,
  ShoppingBag,
  Filter,
  Download,
  UserPlus,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import PurchaseHistory from "./PurchaseHistory";

// Import the supabase client and getAllCustomers function
import { supabase } from "../lib/supabase";
import { getAllCustomers } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { updateCustomer } from "../lib/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  pointsBalance: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalSpent: number;
  lastVisit: Date;
  barcode?: string;
}

interface StaffDashboardProps {
  customers?: Customer[];
}

const StaffDashboard = ({
  customers: initialCustomers,
}: StaffDashboardProps) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customers from the database
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const dbCustomers = await getAllCustomers();

        // Map database customers to the format expected by the component
        const formattedCustomers = dbCustomers.map((customer) => ({
          id: customer.id,
          name: customer.name || "Unknown",
          email: customer.email || "",
          phone: customer.phone || "",
          joinDate: new Date(customer.created_at),
          pointsBalance: customer.points_balance,
          loyaltyTier: customer.loyalty_tier as
            | "Bronze"
            | "Silver"
            | "Gold"
            | "Platinum",
          totalSpent: customer.total_spent,
          lastVisit: new Date(customer.created_at), // Using created_at as lastVisit for now
          barcode: customer.barcode,
        }));

        setCustomers(formattedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        // Use default data if fetch fails
        setCustomers([
          {
            id: "C001",
            name: "Emma Johnson",
            email: "emma.j@example.com",
            phone: "(555) 123-4567",
            joinDate: new Date(2023, 1, 15),
            pointsBalance: 450,
            loyaltyTier: "Silver" as const,
            totalSpent: 1250.75,
            lastVisit: new Date(2023, 7, 28),
          },
          {
            id: "C002",
            name: "Michael Chen",
            email: "m.chen@example.com",
            phone: "(555) 987-6543",
            joinDate: new Date(2022, 11, 3),
            pointsBalance: 890,
            loyaltyTier: "Gold" as const,
            totalSpent: 3450.5,
            lastVisit: new Date(2023, 8, 2),
          },
          {
            id: "C003",
            name: "Sophia Rodriguez",
            email: "sophia.r@example.com",
            phone: "(555) 234-5678",
            joinDate: new Date(2023, 5, 22),
            pointsBalance: 120,
            loyaltyTier: "Bronze" as const,
            totalSpent: 450.25,
            lastVisit: new Date(2023, 7, 15),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("all");

  // Make sure selectedCustomer is always up to date with the latest data
  useEffect(() => {
    if (selectedCustomer) {
      const updatedCustomer = customers.find(
        (c) => c.id === selectedCustomer.id,
      );
      if (
        updatedCustomer &&
        JSON.stringify(updatedCustomer) !== JSON.stringify(selectedCustomer)
      ) {
        setSelectedCustomer(updatedCustomer);
      }
    }
  }, [customers, selectedCustomer]);

  // Filter customers based on search query only
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone &&
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const loyaltyTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "bronze":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "platinum":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Dashboard
          </h1>
          <p className="text-gray-500">
            Manage loyalty program customers and their points
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            // Find the home component and call navigateToRegistration
            const homeElement = document.querySelector(
              '[data-view="registration"]',
            );
            if (homeElement) {
              homeElement.click();
            } else {
              // Fallback - this will be handled by the Home component
              window.location.hash = "#register";
            }
          }}
        >
          <UserPlus size={16} />
          Register New Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{customers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Points Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">
                {customers.reduce(
                  (sum, customer) => sum + customer.pointsBalance,
                  0,
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">
                $
                {customers
                  .reduce((sum, customer) => sum + customer.totalSpent, 0)
                  .toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Points per Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold">
                {Math.round(
                  customers.reduce(
                    (sum, customer) => sum + customer.pointsBalance,
                    0,
                  ) / customers.length,
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading customer data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  View and manage loyalty program customers
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by name, email or phone..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Filter size={16} />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Newest Customers</DropdownMenuItem>
                        <DropdownMenuItem>Highest Points</DropdownMenuItem>
                        <DropdownMenuItem>Most Purchases</DropdownMenuItem>
                        <DropdownMenuItem>Recently Active</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Download size={16} />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="all"
                  className="mb-4"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid grid-cols-1 w-full">
                    <TabsTrigger value="all">All Customers</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <TableRow
                            key={customer.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              // Find the customer in the original list to ensure we have the latest data
                              const updatedCustomer = customers.find(
                                (c) => c.id === customer.id,
                              );
                              setSelectedCustomer(updatedCustomer || customer);
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.id}`}
                                  />
                                  <AvatarFallback>
                                    {customer.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {customer.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {customer.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Input
                                className="w-20 h-6 py-0 px-1 font-medium border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                                type="number"
                                value={customer.pointsBalance}
                                onChange={(e) => {
                                  const newPoints =
                                    parseInt(e.target.value) || 0;
                                  // Update customer points in the list
                                  setCustomers(
                                    customers.map((c) =>
                                      c.id === customer.id
                                        ? { ...c, pointsBalance: newPoints }
                                        : c,
                                    ),
                                  );
                                  // Update in database
                                  updateCustomer(customer.id, {
                                    points_balance: newPoints,
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              $
                              <Input
                                className="w-24 h-6 py-0 px-1 inline-block border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                                type="number"
                                step="0.01"
                                value={customer.totalSpent.toFixed(2)}
                                onChange={(e) => {
                                  const newTotal =
                                    parseFloat(e.target.value) || 0;
                                  // Update customer total spent in the list
                                  setCustomers(
                                    customers.map((c) =>
                                      c.id === customer.id
                                        ? { ...c, totalSpent: newTotal }
                                        : c,
                                    ),
                                  );
                                  // Update in database
                                  updateCustomer(customer.id, {
                                    total_spent: newTotal,
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {customer.lastVisit.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the customer in the original list to ensure we have the latest data
                                    const updatedCustomer = customers.find(
                                      (c) => c.id === customer.id,
                                    );
                                    setSelectedCustomer(
                                      updatedCustomer || customer,
                                    );
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the home component and navigate to profile
                                    const homeElement = document.querySelector(
                                      '[data-view="profile"]',
                                    );
                                    if (homeElement) {
                                      // Set customer data in localStorage for editing
                                      localStorage.setItem(
                                        "editCustomer",
                                        JSON.stringify(customer),
                                      );
                                      homeElement.click();
                                    }
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-6 text-gray-500"
                          >
                            No customers found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>
                  {selectedCustomer
                    ? `Viewing details for ${selectedCustomer.name}`
                    : "Select a customer to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center text-center pb-4 border-b">
                      <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCustomer.id}`}
                        />
                        <AvatarFallback>
                          {selectedCustomer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        className="text-xl font-semibold text-center border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                        value={selectedCustomer.name}
                        onChange={(e) => {
                          // Update selected customer
                          setSelectedCustomer({
                            ...selectedCustomer,
                            name: e.target.value,
                          });
                          // Update in the list
                          setCustomers(
                            customers.map((c) =>
                              c.id === selectedCustomer.id
                                ? { ...c, name: e.target.value }
                                : c,
                            ),
                          );
                          // Update in database
                          updateCustomer(selectedCustomer.id, {
                            name: e.target.value,
                          });
                        }}
                      />
                      <Input
                        className="text-gray-500 text-center border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                        value={selectedCustomer.email}
                        onChange={(e) => {
                          // Update selected customer
                          setSelectedCustomer({
                            ...selectedCustomer,
                            email: e.target.value,
                          });
                          // Update in the list
                          setCustomers(
                            customers.map((c) =>
                              c.id === selectedCustomer.id
                                ? { ...c, email: e.target.value }
                                : c,
                            ),
                          );
                          // Update in database
                          updateCustomer(selectedCustomer.id, {
                            email: e.target.value,
                          });
                        }}
                      />
                      <Input
                        className="text-gray-500 text-center border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                        value={selectedCustomer.phone || ""}
                        placeholder="Phone number"
                        onChange={(e) => {
                          // Update selected customer
                          setSelectedCustomer({
                            ...selectedCustomer,
                            phone: e.target.value,
                          });
                          // Update in database
                          updateCustomer(selectedCustomer.id, {
                            phone: e.target.value,
                          });
                          // Update in the list
                          setCustomers(
                            customers.map((c) =>
                              c.id === selectedCustomer.id
                                ? { ...c, phone: e.target.value }
                                : c,
                            ),
                          );
                        }}
                      />
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 border-blue-200"
                        >
                          Loyalty Member
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-gray-500 text-sm">Points Balance</p>
                        <Input
                          className="text-xl font-bold text-green-600 text-center border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                          type="number"
                          value={selectedCustomer.pointsBalance}
                          onChange={(e) => {
                            const newPoints = parseInt(e.target.value) || 0;
                            // Update selected customer
                            setSelectedCustomer({
                              ...selectedCustomer,
                              pointsBalance: newPoints,
                            });
                            // Update in the list
                            setCustomers(
                              customers.map((c) =>
                                c.id === selectedCustomer.id
                                  ? { ...c, pointsBalance: newPoints }
                                  : c,
                              ),
                            );
                            // Update in database
                            updateCustomer(selectedCustomer.id, {
                              points_balance: newPoints,
                            });
                          }}
                        />
                      </div>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-gray-500 text-sm">Total Spent</p>
                        <div className="text-xl font-bold text-purple-600">
                          $
                          <Input
                            className="w-24 inline-block text-center border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                            type="number"
                            step="0.01"
                            value={selectedCustomer.totalSpent.toFixed(2)}
                            onChange={(e) => {
                              const newTotal = parseFloat(e.target.value) || 0;
                              // Update selected customer
                              setSelectedCustomer({
                                ...selectedCustomer,
                                totalSpent: newTotal,
                              });
                              // Update in the list
                              setCustomers(
                                customers.map((c) =>
                                  c.id === selectedCustomer.id
                                    ? { ...c, totalSpent: newTotal }
                                    : c,
                                ),
                              );
                              // Update in database
                              updateCustomer(selectedCustomer.id, {
                                total_spent: newTotal,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Customer Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">
                          Barcode Registration:
                        </div>
                        <div className="font-mono font-medium">
                          {selectedCustomer.barcode || selectedCustomer.id}
                        </div>
                        <div className="text-gray-500">Join Date:</div>
                        <div>
                          {selectedCustomer.joinDate.toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">Last Visit:</div>
                        <div>
                          {selectedCustomer.lastVisit.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Available Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            alert(
                              `Added 50 points to ${selectedCustomer.name}'s account`,
                            );
                            // Update the customer in the list
                            setCustomers(
                              customers.map((c) =>
                                c.id === selectedCustomer.id
                                  ? {
                                      ...c,
                                      pointsBalance: c.pointsBalance + 50,
                                    }
                                  : c,
                              ),
                            );
                            // Update selected customer
                            setSelectedCustomer({
                              ...selectedCustomer,
                              pointsBalance:
                                selectedCustomer.pointsBalance + 50,
                            });
                          }}
                        >
                          Add Points
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert(
                              `Issued a $10 discount to ${selectedCustomer.name}`,
                            );
                          }}
                        >
                          Issue Discount
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Find the home component and navigate to profile
                            const homeElement = document.querySelector(
                              '[data-view="profile"]',
                            );
                            if (homeElement) {
                              // Set customer data in localStorage for editing
                              localStorage.setItem(
                                "editCustomer",
                                JSON.stringify(selectedCustomer),
                              );
                              homeElement.click();
                            }
                          }}
                        >
                          Edit Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Toggle showing purchase history
                            const historyElement =
                              document.getElementById("purchase-history");
                            if (historyElement) {
                              historyElement.scrollIntoView({
                                behavior: "smooth",
                              });
                            }
                          }}
                        >
                          Purchase History
                        </Button>
                      </div>
                    </div>

                    <div id="purchase-history">
                      <PurchaseHistory customerId={selectedCustomer.id} />
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a customer from the list to view their details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
