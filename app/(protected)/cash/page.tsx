import { Main } from "@/components/layout/main";
import { CashRequestsClient } from "@/components/cash-requests/cash-requests-client";
import { AddCashButton } from "@/components/cash-requests/add-cash-button";
import { getCashRequests } from "@/lib/actions/cash-requests";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCashRequestsSearchParams } from "./search-params";
import type { SearchParams } from "nuqs/server";

// Force dynamic rendering since we use search params
export const dynamic = 'force-dynamic';

interface CashRequestsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CashRequestsPage({ searchParams }: CashRequestsPageProps) {
  const params = await loadCashRequestsSearchParams(searchParams);

  // Get user role and ID
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  let userId: string | undefined = undefined;

  if (user) {
    userId = user.id;
    userRole = (user.app_metadata?.role as string) || null;
  }

  const isFinance = userRole === "FINANCE";

  const paginatedCashRequests = await getCashRequests({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search || undefined,
    status: params.status.length > 0 ? params.status : undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder === "asc" ? "asc" : "desc",
    userId,
    isFinance,
  });

  return (
    <Main>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Cash</h1>
            <AddCashButton />
          </div>
          <p className="text-base text-muted-foreground">
            {isFinance
              ? "Review and manage cash entries from all users"
              : "Submit and track your cash entries"
            }
          </p>
        </div>

        {/* Cash List */}
        <div className="animate-in fade-in-50 duration-500">
          <CashRequestsClient
            cashRequests={paginatedCashRequests.data}
            pagination={{
              total: paginatedCashRequests.total,
              page: paginatedCashRequests.page,
              pageSize: paginatedCashRequests.pageSize,
              totalPages: paginatedCashRequests.totalPages,
            }}
            isFinance={isFinance}
          />
        </div>
      </div>
    </Main>
  );
}
