import { supabase } from "./supabase";

// Simple authentication using just a barcode code
export async function authenticateWithBarcode(barcode: string) {
  try {
    // Check if the barcode exists in the customers table
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("barcode", barcode)
      .maybeSingle();

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

// Log out the user
export function logout() {
  localStorage.removeItem("authenticatedUser");
}
