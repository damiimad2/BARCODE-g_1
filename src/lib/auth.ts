import { supabase } from "./supabase";

// Simple authentication using just a barcode code
export async function authenticateWithBarcode(
  barcode: string,
  storeOwnerId?: string,
) {
  try {
    // Check if the barcode exists in the customers table
    let query = supabase.from("customers").select("*").eq("barcode", barcode);

    // If storeOwnerId is provided, only authenticate customers for this store
    if (storeOwnerId) {
      query = query.eq("store_owner_id", storeOwnerId);
    }

    const { data: customer, error } = await query.maybeSingle();

    if (error) {
      console.error("Error authenticating with barcode:", error);
      return { user: null, error: error.message };
    }

    if (customer) {
      // Store the authenticated user in local storage
      localStorage.setItem("authenticatedUser", JSON.stringify(customer));
      return { user: customer, error: null };
    } else {
      return { user: null, error: "Invalid barcode" };
    }
  } catch (err) {
    console.error("Authentication error:", err);
    return { user: null, error: "Authentication failed" };
  }
}

// Check if user is authenticated
export function getAuthenticatedUser() {
  const userStr = localStorage.getItem("authenticatedUser");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error("Error parsing authenticated user:", err);
    return null;
  }
}

// Check if store owner is authenticated
export function getAuthenticatedStoreOwner() {
  const storeOwnerStr = localStorage.getItem("storeOwner");
  if (!storeOwnerStr) return null;

  try {
    return JSON.parse(storeOwnerStr);
  } catch (err) {
    console.error("Error parsing authenticated store owner:", err);
    return null;
  }
}

// Check if admin is authenticated
export function getAuthenticatedAdmin() {
  const adminStr = localStorage.getItem("admin");
  if (!adminStr) return null;

  try {
    return JSON.parse(adminStr);
  } catch (err) {
    console.error("Error parsing authenticated admin:", err);
    return null;
  }
}

// Log out the user
export function logout() {
  localStorage.removeItem("authenticatedUser");
  localStorage.removeItem("storeOwner");
  localStorage.removeItem("admin");
  localStorage.removeItem("storeOwnerAuthenticated");
  localStorage.removeItem("adminAuthenticated");
}
