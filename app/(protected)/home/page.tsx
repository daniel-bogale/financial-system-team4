import { Main } from "@/components/layout/main";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function Page() {
    const stats = await getDashboardStats();

    return (
        <Main>
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Overview of your financial activities
                    </p>
                </div>

                <div className="animate-in fade-in-50 duration-500">
                    <DashboardClient stats={stats} />
                </div>
            </div>
        </Main>
    );
}
