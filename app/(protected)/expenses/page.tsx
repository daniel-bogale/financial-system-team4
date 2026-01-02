import { Main } from "@/components/layout/main";
import { ExpensesClient } from "@/components/expenses/expenses-client";
import { getExpenses } from "@/lib/actions/expenses";
import { loadExpensesSearchParams } from "./search-params";
import type { SearchParams } from "nuqs/server";

// Force dynamic rendering since we use search params
export const dynamic = 'force-dynamic';

interface ExpensesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await loadExpensesSearchParams(searchParams);
  const paginatedExpenses = await getExpenses({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search || undefined,
    category: params.category.length > 0 ? params.category : undefined,
    verified: params.verified.length > 0 ? params.verified : undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder === "asc" ? "asc" : "desc",
  });

  return (
    <Main>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Expenses</h1>
          </div>
          <p className="text-base text-muted-foreground">
            Track and manage all recorded expenses
          </p>
        </div>

        {/* Expenses List */}
        <div className="animate-in fade-in-50 duration-500">
          <ExpensesClient
            expenses={paginatedExpenses.data}
            pagination={{
              total: paginatedExpenses.total,
              page: paginatedExpenses.page,
              pageSize: paginatedExpenses.pageSize,
              totalPages: paginatedExpenses.totalPages,
            }}
          />
        </div>
      </div>
    </Main>
  );
}
