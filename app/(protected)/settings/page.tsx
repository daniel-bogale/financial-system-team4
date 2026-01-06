import { Main } from "@/components/layout/main";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from "@/components/ui/badge";
import NotificationSettings from "@/components/settings/notifications-settings";
import { getNotificationsStatus } from "@/lib/settings";
import ThemeSettings from "@/components/settings/theme-settings";
import EditProfileButton from "@/components/edit-profile-button";

// Force dynamic rendering since we use search params
export const dynamic = 'force-dynamic';


export default async function UsersPage() {
    // Check if user has FINANCE role
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    };


    const fullName = (user.user_metadata?.full_name as string) ||
        user.email?.split("@")[0] ||
        "Unknown";

    const role = (user.app_metadata?.role as string) || "STAFF";
    const email = user.email;

    const initials = getInitials(fullName);

    const notificationsEnabled = await getNotificationsStatus();

    return (
        <Main>
            <div className="space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Settings</h1>
                    </div>
                    <p className="text-base text-muted-foreground">
                        Manage your profile and preferences
                    </p>
                </div>

                {/* Main content */}
                <div className="space-y-4">
                    <div className="bg-card p-6 rounded-lg flex items-center gap-6">
                        <Avatar className="h-16 w-16">
                            {user.user_metadata?.avatar_url ? (
                                <AvatarImage src={user.user_metadata?.avatar_url as string} alt={fullName} />
                            ) : (
                                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold truncate">{fullName}</p>
                            <p className="text-sm text-muted-foreground truncate">{email}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                                {role}
                            </Badge>
                            <EditProfileButton fullName={fullName} userId={user.id} />
                        </div>
                    </div>
                </div>
                <ThemeSettings/>
                <NotificationSettings defaultSetting={notificationsEnabled} />
            </div>
        </Main>
    );
}
