"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Expense } from "@/components/expenses/expenses-types";

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
