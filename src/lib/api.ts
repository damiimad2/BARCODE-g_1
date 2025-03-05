import { supabase } from "./supabase";
import { Database } from "./database.types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
type Discount = Database["public"]["Tables"]["discounts"]["Row"];

// Customer functions
export async function getCustomerByBarcode(
  barcode: string,
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) {
    console.error("Error fetching customer:", error);
    return null;
  }

  return data;
}

export async function createCustomer(
  customerData: Database["public"]["Tables"]["customers"]["Insert"],
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .insert(customerData)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error creating customer:", error);
    return null;
  }

  return data;
}

export async function updateCustomer(
  id: string,
  updates: Database["public"]["Tables"]["customers"]["Update"],
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating customer:", error);
    return null;
  }

  return data;
}

export async function getAllCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return data || [];
}

// Purchase functions
export async function recordPurchase(
  purchaseData: Database["public"]["Tables"]["purchases"]["Insert"],
): Promise<Purchase | null> {
  // First record the purchase
  const { data, error } = await supabase
    .from("purchases")
    .insert(purchaseData)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error recording purchase:", error);
    return null;
  }

  // Then update the customer's points balance and total spent
  const { data: customer } = await supabase
    .from("customers")
    .select("points_balance, total_spent")
    .eq("id", purchaseData.customer_id)
    .maybeSingle();

  if (customer) {
    await supabase
      .from("customers")
      .update({
        points_balance: customer.points_balance + purchaseData.points_earned,
        total_spent: customer.total_spent + purchaseData.amount,
      })
      .eq("id", purchaseData.customer_id);
  }

  // If a discount was applied, mark it as used
  if (purchaseData.discount_applied) {
    // This assumes you have a way to identify which discount was used
    // You might need to modify this logic based on your actual implementation
    await supabase
      .from("discounts")
      .update({ is_used: true })
      .eq("customer_id", purchaseData.customer_id)
      .eq("amount", purchaseData.discount_applied)
      .eq("is_used", false)
      .limit(1);
  }

  return data;
}

export async function getCustomerPurchases(
  customerId: string,
): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }

  return data || [];
}

// Discount functions
export async function getCustomerDiscounts(
  customerId: string,
): Promise<Discount[]> {
  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("customer_id", customerId)
    .eq("is_used", false)
    .gte("expiry_date", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discounts:", error);
    return [];
  }

  return data || [];
}

export async function createDiscount(
  discountData: Database["public"]["Tables"]["discounts"]["Insert"],
): Promise<Discount | null> {
  const { data, error } = await supabase
    .from("discounts")
    .insert(discountData)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error creating discount:", error);
    return null;
  }

  return data;
}

// Helper function to generate a unique barcode
export function generateBarcode(): string {
  return `LC${Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")}`;
}

// Helper function previously used for loyalty tier calculation
// Now removed as loyalty tiers are no longer used
export function calculateLoyaltyTier(): string {
  return "";
}

// Calculate points (1 point per $2 spent, rounded to nearest whole number)
export function calculatePoints(amount: number): number {
  return Math.round(amount / 2);
}
