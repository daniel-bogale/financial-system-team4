"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Expense } from "@/components/expenses/expenses-types";
import { z } from "zod";

export interface GetExpensesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string[];
  verified?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetExpensesResult {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const SORTABLE_COLUMNS = new Set([
  "category",
  "amount",
  "verified",
  "created_at",
]);

export async function getExpenses(
  params: GetExpensesParams = {}
): Promise<GetExpensesResult> {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      category = [],
      verified = [],
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;

    const supabase = await createSupabaseServerClient();

    // Build query with filters
    let query = supabase.from("expenses").select("*", { count: "exact" });

    // Apply category filter
    if (category.length > 0) {
      query = query.in("category", category);
    }

    // Apply verified filter
    if (verified.length > 0) {
      const verifiedBools = verified.map((v) => v === "true");
      query = query.in("verified", verifiedBools);
    }

    // Apply search filter (search in category)
    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query = query.ilike("category", searchTerm);
    }

    // Get total count with filters applied
    const { count, error: countError } = await query;

    if (countError) {
      console.error("Error fetching expenses count:", countError);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    // Validate and set sort column
    const validSortBy = SORTABLE_COLUMNS.has(sortBy) ? sortBy : "created_at";
    const ascending = sortOrder === "asc";

    // Calculate offset
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Rebuild query for fetching data with same filters
    let dataQuery = supabase.from("expenses").select("*");

    // Apply same filters
    if (category.length > 0) {
      dataQuery = dataQuery.in("category", category);
    }

    if (verified.length > 0) {
      const verifiedBools = verified.map((v) => v === "true");
      dataQuery = dataQuery.in("verified", verifiedBools);
    }

    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      dataQuery = dataQuery.ilike("category", searchTerm);
    }

    // Apply sorting and pagination
    dataQuery = dataQuery.order(validSortBy, { ascending }).range(from, to);

    const { data, error } = await dataQuery;

    if (error) {
      console.error("Error fetching expenses:", error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    return {
      data: (data as Expense[]) || [],
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Error in getExpenses:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }
}

const createExpenseSchema = z.object({
  budget_id: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
});

export async function createExpense(_: unknown, formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Authentication required." };
    }

    // Get user role from JWT app_metadata
    const userRole = (user.app_metadata?.role as string) || null;

    if (!userRole) {
      return { error: "Failed to fetch user role." };
    }

    // Check if user is FINANCE (only Finance can create expenses)
    if (userRole !== "FINANCE") {
      return { error: "Only FINANCE users can create expenses." };
    }

    // Parse and validate form data
    const budgetId = formData.get("budget_id") as string | null;
    const amount = parseFloat(formData.get("amount") as string);
    const category = formData.get("category") as string;
    const receiptFile = formData.get("receipt") as File | null;

    const parsed = createExpenseSchema.safeParse({
      budget_id: budgetId || undefined,
      amount,
      category,
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    let receiptUrl: string | null = null;

    // Upload receipt if provided
    if (receiptFile && receiptFile.size > 0) {
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}-receipt.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile);

      if (uploadError) {
        console.error("Error uploading receipt:", uploadError);
        return { error: "Failed to upload receipt: " + uploadError.message };
      }

      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    // Validate budget if provided
    if (budgetId) {
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("id, status")
        .eq("id", budgetId)
        .single();

      if (budgetError || !budget) {
        return { error: "Budget not found" };
      }

      if (budget.status !== "APPROVED") {
        return { error: "Expenses can only be linked to approved budgets" };
      }
    }

    // Insert the expense
    const { error: insertError } = await supabase.from("expenses").insert({
      budget_id: budgetId || null,
      amount: parsed.data.amount,
      category: parsed.data.category,
      verified: false,
      receipt_url: receiptUrl,
      created_by: user.id,
    });

    if (insertError) {
      console.error("Error creating expense:", insertError);
      return { error: insertError.message };
    }

    // Revalidate the expenses page
    revalidatePath("/expenses");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in createExpense:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown server error",
    };
  }
}

export async function verifyExpense(expenseId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Authentication required." };
    }

    // Get user role from JWT app_metadata
    const userRole = (user.app_metadata?.role as string) || null;

    if (!userRole) {
      return { error: "Failed to fetch user role." };
    }

    // Check if user is FINANCE
    if (userRole !== "FINANCE") {
      return { error: "Only FINANCE users can verify expenses." };
    }

    // Get the expense to check if it's already verified and get budget_id
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .select("id, budget_id, amount, verified")
      .eq("id", expenseId)
      .single();

    if (expenseError || !expense) {
      return { error: "Expense not found" };
    }

    if (expense.verified) {
      return { error: "Expense is already verified" };
    }

    // Update expense to verified
    const { error: updateError } = await supabase
      .from("expenses")
      .update({ verified: true })
      .eq("id", expenseId);

    if (updateError) {
      console.error("Error verifying expense:", updateError);
      return { error: updateError.message };
    }

    // If expense is linked to a budget, update the budget's used amount
    if (expense.budget_id) {
      // Get current budget
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .select("id, used")
        .eq("id", expense.budget_id)
        .single();

      if (!budgetError && budget) {
        const newUsed = (budget.used || 0) + expense.amount;

        // Update budget used amount
        const { error: budgetUpdateError } = await supabase
          .from("budgets")
          .update({ used: newUsed })
          .eq("id", expense.budget_id);

        if (budgetUpdateError) {
          console.error("Error updating budget used amount:", budgetUpdateError);
          // Don't fail the verification, just log the error
        }
      }
    }

    // Revalidate the expenses page
    revalidatePath("/expenses");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in verifyExpense:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown server error",
    };
  }
}

export async function getBudgetsForExpense() {
  try {
    const supabase = await createSupabaseServerClient();

    // Only return APPROVED budgets
    const { data, error } = await supabase
      .from("budgets")
      .select("id, department, amount, used, status")
      .eq("status", "APPROVED")
      .order("department", { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch {
    return { data: [], error: "Failed to load budgets" };
  }
}
