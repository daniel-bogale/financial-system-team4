"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CashRequest } from "@/components/cash-requests/cash-requests-types";

export interface GetCashRequestsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  userId?: string;
  isFinance?: boolean;
}

export interface GetCashRequestsResult {
  data: CashRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const SORTABLE_COLUMNS = new Set(["purpose", "amount", "status", "created_at"]);

export async function getCashRequests(
  params: GetCashRequestsParams = {}
): Promise<GetCashRequestsResult> {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = [],
      sortBy = "created_at",
      sortOrder = "desc",
      userId,
      isFinance = false,
    } = params;

    const supabase = await createSupabaseServerClient();

    // Build query with filters
    let query = supabase.from("cash_requests").select("*", { count: "exact" });

    // If not finance, only show user's own requests
    if (!isFinance && userId) {
      query = query.eq("created_by", userId);
    }

    // Apply status filter
    if (status.length > 0) {
      query = query.in("status", status);
    }

    // Apply search filter (search in purpose)
    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query = query.ilike("purpose", searchTerm);
    }

    // Get total count with filters applied
    const { count, error: countError } = await query;

    if (countError) {
      console.error("Error fetching cash requests count:", countError);
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
    let dataQuery = supabase.from("cash_requests").select("*");

    // Apply same filters
    if (!isFinance && userId) {
      dataQuery = dataQuery.eq("created_by", userId);
    }

    if (status.length > 0) {
      dataQuery = dataQuery.in("status", status);
    }

    if (search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      dataQuery = dataQuery.ilike("purpose", searchTerm);
    }

    // Apply sorting and pagination
    dataQuery = dataQuery.order(validSortBy, { ascending }).range(from, to);

    const { data, error } = await dataQuery;

    if (error) {
      console.error("Error fetching cash requests:", error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    return {
      data: (data as CashRequest[]) || [],
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Error in getCashRequests:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }
}

export async function approveCashRequest(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("cash_requests")
      .update({ status: "APPROVED" })
      .eq("id", id)
      .eq("status", "PENDING");

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/cash");
    return { success: true };
  } catch {
    return { error: "Failed to approve cash" };
  }
}

export async function rejectCashRequest(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("cash_requests")
      .update({ status: "REJECTED" })
      .eq("id", id)
      .eq("status", "PENDING");

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/cash");
    return { success: true };
  } catch {
    return { error: "Failed to reject cash" };
  }
}

export async function disburseCashRequest(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("cash_requests")
      .update({ status: "DISBURSED" })
      .eq("id", id)
      .eq("status", "APPROVED");

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/cash");
    return { success: true };
  } catch {
    return { error: "Failed to disburse cash" };
  }
}

export async function deleteCashRequest(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("cash_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/cash");
    return { success: true };
  } catch {
    return { error: "Failed to delete cash" };
  }
}

export async function createCashRequest(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const supabase = await createSupabaseServerClient();

    const budgetId = formData.get("budget_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const purpose = formData.get("purpose") as string;

    if (!budgetId) {
      return { error: "Budget is required" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { error: "Amount must be a positive number" };
    }

    if (!purpose?.trim()) {
      return { error: "Purpose is required" };
    }

    const { error } = await supabase.from("cash_requests").insert({
      budget_id: budgetId,
      amount,
      purpose: purpose.trim(),
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/cash");
    return { success: true };
  } catch {
    return { error: "Failed to create cash request" };
  }
}

export async function getBudgetsForCashRequest() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("budgets")
      .select("id, department")
      .order("department", { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch {
    return { data: [], error: "Failed to load budgets" };
  }
}
