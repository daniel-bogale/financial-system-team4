'use client'
import { useEffect, useState } from "react";
import NotificationToggle from "./notification-toggle";
import { getNotificationsStatus, setNotificationsStatus } from "@/lib/settings";


export default function NotificationSettings({ defaultSetting }: { defaultSetting: boolean }) {

    const [notifsOn, setNotifsOn] = useState(defaultSetting);
    const [loading, setLoading] = useState(false);

    return (<div className="bg-card p-4 rounded-lg flex items-center justify-between">
        <div>
            <p className="font-medium">Notifications</p>
            <p className="text-sm text-muted-foreground">Enable or disable application notifications</p>
        </div>
        <NotificationToggle value={notifsOn} disabled={loading} onChange={async () => {
            setLoading(true);
            await setNotificationsStatus(!notifsOn);
            setNotifsOn(!notifsOn);
            setLoading(false);
        }} />
    </div>
    );
}