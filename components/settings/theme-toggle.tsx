"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options: { key: string; label: string }[] = [
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
    { key: "system", label: "System" },
  ];

  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-muted p-1">
      {options.map((opt) => {
        const active = theme === opt.key;
        return (
          <Button
            key={opt.key}
            size="sm"
            variant={active ? "default" : "ghost"}
            className={active ? "shadow-sm" : "opacity-90 hover:opacity-100"}
            onClick={() => setTheme(opt.key)}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
