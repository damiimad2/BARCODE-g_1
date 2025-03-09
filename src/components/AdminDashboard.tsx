import React, { useState, useEffect } from "react";
import {
  Users,
  Store,
  UserPlus,
  Trash2,
  Edit,
  Loader2,
  Search,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
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
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { supabase } from "../lib/supabase";

interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  store_name: string;
  logo_url?: string;
  created_at: string;
  is_active: boolean;
  customerCount?: number;
}

const AdminDashboard = () => {
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<StoreOwner | null>(null);
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    store_name: "",
    password: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch store owners from the database
  useEffect(() => {
    const fetchStoreOwners = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("store_owners")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Get customer counts for each store owner
        const ownersWithCounts = await Promise.all(
          data.map(async (owner) => {
            const { count, error: countError } = await supabase
              .from("customers")
              .select("*", { count: "exact", head: true })
              .eq("store_owner_id", owner.id);

            return {
              ...owner,
              customerCount: count || 0,
            };
          }),
        );

        setStoreOwners(ownersWithCounts);
      } catch (error) {
        console.error("Error fetching store owners:", error);
        // Use default data if fetch fails
        setStoreOwners([
          {
            id: "1",
            name: "John Smith",
            email: "john@perfumeshop.com",
            phone: "(555) 123-4567",
            store_name: "Luxury Perfumes",
            created_at: new Date().toISOString(),
            is_active: true,
            customerCount: 24,
          },
          {
            id: "2",
            name: "Sarah Johnson",
            email: "sarah@scentshop.com",
            phone: "(555) 987-6543",
            store_name: "Scent Shop",
            created_at: new Date(
              new Date().setMonth(new Date().getMonth() - 2),
            ).toISOString(),
            is_active: true,
            customerCount: 18,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreOwners();
  }, []);

  // Filter store owners based on search query
  const filteredOwners = storeOwners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.store_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handle creating a new store owner
  const handleCreateOwner = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate inputs
      if (
        !newOwner.name ||
        !newOwner.email ||
        !newOwner.store_name ||
        !newOwner.password
      ) {
        setError("Please fill in all required fields");
        return;
      }

      // Create the store owner in the database
      const { data, error } = await supabase
        .from("store_owners")
        .insert([
          {
            name: newOwner.name,
            email: newOwner.email,
            phone: newOwner.phone,
            store_name: newOwner.store_name,
            password: newOwner.password, // In a real app, this would be hashed
          },
        ])
        .select();

      if (error) throw error;

      // Add the new store owner to the list
      if (data && data[0]) {
        setStoreOwners([{ ...data[0], customerCount: 0 }, ...storeOwners]);
        setIsDialogOpen(false);
        setNewOwner({
          name: "",
          email: "",
          phone: "",
          store_name: "",
          password: "",
        });
      }
    } catch (err) {
      console.error("Error creating store owner:", err);
      setError("Failed to create store owner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a store owner
  const handleDeleteOwner = async (id: string) => {
    try {
      const { error } = await supabase
        .from("store_owners")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove the store owner from the list
      setStoreOwners(storeOwners.filter((owner) => owner.id !== id));
    } catch (err) {
      console.error("Error deleting store owner:", err);
      alert("Failed to delete store owner. Please try again.");
    }
  };

  // Handle toggling store owner active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("store_owners")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // Update the store owner in the list
      setStoreOwners(
        storeOwners.map((owner) =>
          owner.id === id ? { ...owner, is_active: !currentStatus } : owner,
        ),
      );
    } catch (err) {
      console.error("Error updating store owner status:", err);
      alert("Failed to update store owner status. Please try again.");
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">
            Manage store owners and their loyalty programs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              Add Store Owner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store Owner</DialogTitle>
              <DialogDescription>
                Create a new store owner account for the loyalty program
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name*
                </Label>
                <Input
                  id="name"
                  value={newOwner.name}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email*
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newOwner.email}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newOwner.phone}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, phone: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="store_name" className="text-right">
                  Store Name*
                </Label>
                <Input
                  id="store_name"
                  value={newOwner.store_name}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, store_name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password*
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newOwner.password}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, password: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateOwner}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Store Owner"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Store Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Store className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{storeOwners.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Stores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Store className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">
                {storeOwners.filter((owner) => owner.is_active).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">
                {storeOwners.reduce(
                  (sum, owner) => sum + (owner.customerCount || 0),
                  0,
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading store owner data...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Store Owner Management</CardTitle>
            <CardDescription>
              View and manage store owners in the loyalty program system
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email or store name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Owner</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                      <TableRow key={owner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`}
                              />
                              <AvatarFallback>
                                {owner.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{owner.name}</div>
                              <div className="text-sm text-gray-500">
                                {owner.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{owner.store_name}</div>
                          <div className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(owner.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            {owner.customerCount || 0} customers
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${owner.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                          >
                            {owner.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleToggleActive(owner.id, owner.is_active)
                              }
                            >
                              {owner.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Store Owner
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {owner.name}
                                    's store account? This action cannot be
                                    undone and will affect all associated
                                    customer data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteOwner(owner.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No store owners found matching your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
