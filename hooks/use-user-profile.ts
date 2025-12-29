import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  role: string;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return { profile, loading };
}
