import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar: string | null;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Use user metadata instead of profiles table
      const role = (user.app_metadata?.role as string) || "STAFF";
      const fullName =
        (user.user_metadata?.full_name as string) ||
        user.email?.split("@")[0] ||
        "Unknown";

      setProfile({
        id: user.id,
        full_name: fullName,
        role: role,
        email: user.email!,
        avatar: user.user_metadata?.avatar_url
      });

      setLoading(false);
    };
    fetchProfile();
  }, []);

  return { profile, loading };
}
