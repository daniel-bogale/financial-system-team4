'use server'
import { createSupabaseServerClient } from "./supabase/server";

export async function getNotificationsStatus() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('notifications')
        .eq('id', user?.id);

    return profiles![0].notifications;
}

export async function setNotificationsStatus(val: boolean) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    await supabase
        .from('profiles')
        .update({ notifications: val })
        .eq('id', user?.id)
        .select();
}

export async function setUserFullName(name: string) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.updateUser({
        data: { full_name: name },
    });
}

export async function setUserPassword(password: string) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.updateUser({
        password: password
    });
}

export async function setUserAvatar(fileName: string, avatar: File) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatar);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl },
    });
}