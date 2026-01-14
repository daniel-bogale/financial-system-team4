import { Main } from "@/components/layout/main";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
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

    const stats = await getDashboardStats(userId, userRole);

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
