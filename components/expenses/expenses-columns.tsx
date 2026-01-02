"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Expense } from "./expenses-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function createExpensesColumns(): ColumnDef<Expense>[] {
    return [
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.getValue("category") as string | null;
                return (
                    <span className="font-medium">{category || "—"}</span>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = row.getValue("amount") as number;
                return (
                    <span className="font-semibold tabular-nums">
                        {formatCurrency(amount)}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "budget_id",
            header: "Budget",
            cell: ({ row }) => {
                const budgetId = row.getValue("budget_id") as string | null;
                return (
                    <span className="text-muted-foreground">
                        {budgetId ? budgetId.slice(0, 8) + "..." : "—"}
                    </span>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "verified",
            header: "Verified",
            cell: ({ row }) => {
                const verified = row.getValue("verified") as boolean | null;
                return (
                    <Badge
                        className={cn(
                            "capitalize",
                            verified
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                        )}
                    >
                        {verified ? "Verified" : "Pending"}
                    </Badge>
                );
            },
            enableSorting: true,
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true;
                const verified = row.getValue(id) as boolean | null;
                const verifiedStr = verified ? "true" : "false";
                return value.includes(verifiedStr);
            },
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return (
                    <span className="text-muted-foreground">
                        {formatDate(date)}
                    </span>
                );
            },
            enableSorting: true,
        },
    ];
}
