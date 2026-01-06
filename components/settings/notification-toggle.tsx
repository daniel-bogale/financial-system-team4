"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
    value?: boolean;
    onChange?: (v: boolean) => void;
    disabled?: boolean;
    className?: string;
};

export default function NotificationToggle({ value = false, onChange, disabled = false, className }: Props) {
    return (
        <div className={cn("inline-flex items-center gap-3", className)}>
            <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
            <Switch checked={value} onCheckedChange={(v) => onChange?.(Boolean(v))} disabled={disabled} />
        </div>
    );
}

