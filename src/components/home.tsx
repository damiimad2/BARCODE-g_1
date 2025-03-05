import React, { useState, useEffect } from "react";
import Header from "./Header";
import BarcodeScanner from "./BarcodeScanner";
import CustomerProfile from "./CustomerProfile";
import CustomerRegistration from "./CustomerRegistration";
import PurchaseRecorder from "./PurchaseRecorder";
import StaffDashboard from "./StaffDashboard";
import Login from "./Login";
import AdminLogin from "./AdminLogin";
import {
  getCustomerByBarcode,
  getCustomerDiscounts,
  getCustomerPurchases,
  createCustomer,
} from "../lib/api";
import { Database } from "../lib/database.types";
import {
  getAuthenticatedUser,
  logout,
  authenticateWithBarcode,
} from "../lib/auth";

type ActiveView =
  | "scanner"
  | "profile"
  | "registration"
  | "purchase"
  | "dashboard"
  | "login"
  | "adminLogin";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Discount = Database["public"]["Tables"]["discounts"]["Row"];

const Home = () => {
  const [activeView, setActiveView] = useState<ActiveView>("login");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [customerDiscounts, setCustomerDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for authenticated user on load
  useEffect(() => {
    const user = getAuthenticatedUser();
    if (user) {
      setIsAuthenticated(true);
      setCustomerId(user.barcode);
      setCustomerData(user);
      setActiveView("profile");
    }
  }, []);

  // Load customer data when customerId changes
  useEffect(() => {
    if (customerId) {
      loadCustomerData(customerId);
    }
  }, [customerId]);

  const loadCustomerData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get customer data and discounts
      const customer = await getCustomerByBarcode(id);

      if (customer) {
        setCustomerData(customer);

        // Get customer discounts
        const discounts = await getCustomerDiscounts(customer.id);
        setCustomerDiscounts(discounts);
      } else {
        setError("Customer not found");
      }
    } catch (err) {
      console.error("Error loading customer data:", err);
      setError("Failed to load customer data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = async (
    barcodeData: string,
    customerExists: boolean,
  ) => {
    setScannedBarcode(barcodeData);

    if (customerExists) {
      // For existing customers, show purchase recorder
      setCustomerId(barcodeData);
      setActiveView("purchase");
    } else {
      // Auto-register the customer with just the barcode
      // Give 10 points for registration
      const customerData = {
        name: `Customer ${barcodeData.substring(2, 6)}`,
        email: null,
        phone: null,
        address: null,
        points_balance: 10, // Start with 10 points for registration
        total_spent: 0,
        barcode: barcodeData,
        birthdate: null,
      };

      try {
        const newCustomer = await createCustomer(customerData);
        if (newCustomer) {
          // Auto-login after registration
          const { user } = await authenticateWithBarcode(barcodeData);
          if (user) {
            setIsAuthenticated(true);
            setCustomerId(user.barcode);
            setCustomerData(user);
            setActiveView("profile");
          }
        }
      } catch (err) {
        console.error("Error auto-registering customer:", err);
        // Fall back to manual registration if auto-registration fails
        setActiveView("registration");
      }
    }
  };

  // Handle customer registration
  const handleCustomerRegistration = (data: Customer) => {
    setCustomerId(data.barcode);
    setCustomerData(data);
    setActiveView("profile");
  };

  // Handle purchase recording
  const handlePurchaseComplete = async (purchaseData: any) => {
    // After purchase is recorded, refresh customer data
    if (customerId && customerData) {
      await loadCustomerData(customerId);
    }

    setTimeout(() => {
      setActiveView("profile");
    }, 2000);
  };

  // Handle login
  const handleLogin = (user: Customer) => {
    setIsAuthenticated(true);
    setCustomerId(user.barcode);
    setCustomerData(user);
    setActiveView("profile");
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCustomerId(null);
    setCustomerData(null);
    setActiveView("login");
  };

  // Navigation functions
  const navigateToScanner = () => setActiveView("scanner");
  const navigateToProfile = () => customerId && setActiveView("profile");
  const navigateToPurchase = () => customerId && setActiveView("purchase");
  const navigateToDashboard = () => {
    // Always go directly to dashboard for easier editing
    setActiveView("dashboard");
  };

  const navigateToRegistration = () => setActiveView("registration");
  const navigateToLogin = () => setActiveView("login");

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onNotificationsClick={() => {}}
        onSettingsClick={() => {}}
        onProfileClick={isAuthenticated ? navigateToProfile : navigateToLogin}
        onAdminClick={() => {
          // Force navigation to dashboard directly
          setActiveView("dashboard");
        }}
        userName={customerData?.name || "Guest"}
        userAvatarUrl={
          customerData
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${customerData.id}`
            : undefined
        }
      />

      <main className="container mx-auto px-4 py-8">
        {/* Navigation Buttons */}
        {isAuthenticated && (
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={navigateToScanner}
              className={`px-4 py-2 rounded-md ${activeView === "scanner" ? "bg-primary text-white" : "bg-white text-gray-800 border border-gray-200"}`}
              data-view="scanner"
            >
              Scan Barcode
            </button>

            {customerId && (
              <>
                <button
                  onClick={navigateToProfile}
                  className={`px-4 py-2 rounded-md ${activeView === "profile" ? "bg-primary text-white" : "bg-white text-gray-800 border border-gray-200"}`}
                  data-view="profile"
                >
                  My Profile
                </button>

                <button
                  onClick={navigateToPurchase}
                  className={`px-4 py-2 rounded-md ${activeView === "purchase" ? "bg-primary text-white" : "bg-white text-gray-800 border border-gray-200"}`}
                  data-view="purchase"
                >
                  Record Purchase
                </button>
              </>
            )}

            <button
              onClick={navigateToDashboard}
              className={`px-4 py-2 rounded-md ${activeView === "dashboard" ? "bg-primary text-white" : "bg-white text-gray-800 border border-gray-200"}`}
              data-view="dashboard"
            >
              Staff Dashboard
            </button>

            <button
              onClick={navigateToRegistration}
              className={`px-4 py-2 rounded-md ${activeView === "registration" ? "bg-primary text-white" : "bg-white text-gray-800 border border-gray-200"}`}
              data-view="registration"
            >
              Register Customer
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md ml-auto bg-white text-red-600 border border-red-200 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}

        {/* Active Component */}
        <div className="flex justify-center">
          {activeView === "login" && (
            <Login
              onLogin={handleLogin}
              onRegister={() => setActiveView("registration")}
            />
          )}

          {activeView === "scanner" && (
            <BarcodeScanner onScan={handleBarcodeScan} />
          )}

          {activeView === "profile" && customerId && customerData && (
            <CustomerProfile
              customer={{
                id: customerData.id,
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                address: customerData.address || "",
                joinDate: new Date(customerData.created_at),
                pointsBalance: customerData.points_balance,
                totalSpent: customerData.total_spent,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customerData.id}`,
              }}
              discounts={customerDiscounts.map((d) => ({
                id: d.id,
                amount: d.amount,
                expiryDate: new Date(d.expiry_date),
                isUsed: d.is_used,
              }))}
            />
          )}

          {activeView === "registration" && (
            <CustomerRegistration
              onRegister={handleCustomerRegistration}
              initialBarcode={scannedBarcode}
              onLogin={handleLogin}
            />
          )}

          {activeView === "purchase" && customerId && customerData && (
            <PurchaseRecorder
              customerId={customerData.id}
              customerName={customerData.name}
              currentPoints={customerData.points_balance}
              availableDiscounts={customerDiscounts.map((d) => ({
                id: d.id,
                value: d.amount,
                description: `${d.amount} off purchase`,
              }))}
              onPurchaseComplete={handlePurchaseComplete}
            />
          )}

          {activeView === "adminLogin" && (
            <AdminLogin onLogin={() => setActiveView("dashboard")} />
          )}

          {activeView === "dashboard" && <StaffDashboard />}
        </div>
      </main>
    </div>
  );
};

export default Home;
