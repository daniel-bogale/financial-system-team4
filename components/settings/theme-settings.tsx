'use client'
import ThemeToggle from "./theme-toggle";


export default function ThemeSettings() {
    return <div className="bg-card p-4 rounded-lg flex items-center justify-between">
        <div>
            <p className="font-medium">Application theme</p>
            <p className="text-sm text-muted-foreground">Choose light, dark, or follow system preference</p>
        </div>
        <ThemeToggle />
    </div>;
}

