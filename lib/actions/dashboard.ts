"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Expense } from "@/components/expenses/expenses-types";
import type { Budget } from "@/components/budgets/budgets-types";
import type { CashRequest } from "@/components/cash-requests/cash-requests-types";

export interface DashboardStats {
  expenses: {
    total: number;
    amount: number;
    recent: Expense[];
  };
  budgets: {
    total: number;
    amount: number;
    recent: Budget[];
  };
  cashRequests: {
    total: number;
    amount: number;
    recent: CashRequest[];
  };
}

export async function getDashboardStats(userId?: string, userRole?: string | null): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();

  // Finance Team: Full access to all reports
  // General Staff: Limited to their own requests/budgets
  const isFinance = userRole === "FINANCE";

  // Build base queries
  let expensesQuery = supabase.from("expenses").select("*", { count: "exact" });
  let budgetsQuery = supabase.from("budgets").select("*", { count: "exact" });
  let cashRequestsQuery = supabase.from("cash_requests").select("*", { count: "exact" });

  // Filter by user if not Finance
  if (!isFinance && userId) {
    budgetsQuery = budgetsQuery.eq("created_by", userId);
    cashRequestsQuery = cashRequestsQuery.eq("created_by", userId);
    // Expenses are created by Finance, but Staff can see expenses linked to their budgets
    // For simplicity, Finance-created expenses are visible to all, but we could filter by budget_id if needed
  }

  // Fetch Expenses Stats
  const { data: expensesData, count: expensesCount } = await expensesQuery
    .order("created_at", { ascending: false });

  const expensesAmount = (expensesData || []).reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  // Fetch Budgets Stats
  const { data: budgetsData, count: budgetsCount } = await budgetsQuery
    .order("created_at", { ascending: false });

  const budgetsAmount = (budgetsData || []).reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  // Fetch Cash Requests Stats
  const { data: cashRequestsData, count: cashRequestsCount } = await cashRequestsQuery
    .order("created_at", { ascending: false });

  const cashRequestsAmount = (cashRequestsData || []).reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  return {
    expenses: {
      total: expensesCount || 0,
      amount: expensesAmount,
      recent: (expensesData || []).slice(0, 5) as Expense[],
    },
    budgets: {
      total: budgetsCount || 0,
      amount: budgetsAmount,
      recent: (budgetsData || []).slice(0, 5) as Budget[],
    },
    cashRequests: {
      total: cashRequestsCount || 0,
      amount: cashRequestsAmount,
      recent: (cashRequestsData || []).slice(0, 5) as CashRequest[],
    },
  };
}
