"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import type { Expense } from "./expenses-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, CheckIcon, Loader2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { verifyExpense } from "@/lib/actions/expenses";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

function ExpenseActions({ expense, userRole }: { expense: Expense; userRole: string | null }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);

    const handleVerify = () => {
        startTransition(async () => {
            const result = await verifyExpense(expense.id);
            if (result?.error) {
                toast.error("Failed to verify expense: " + result.error);
            } else {
                toast.success("Expense verified successfully");
                router.refresh();
            }
            setShowVerifyDialog(false);
        });
    };

    const isFinance = userRole === "FINANCE";
    const isUnverified = !expense.verified;

    if (!isFinance || !isUnverified) {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreVertical className="h-4 w-4" />
                        )}
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => setShowVerifyDialog(true)}
                        className="text-green-700 focus:text-green-800 focus:bg-green-50 dark:text-green-400 dark:focus:bg-green-950"
                    >
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Verify
                    </DropdownMenuItem>
                    {expense.receipt_url && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a
                                    href={expense.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Receipt
                                </a>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Verify Confirmation Dialog */}
            <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Verify Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to verify this expense for{" "}
                            <strong>{formatCurrency(expense.amount)}</strong>? This action
                            will update the linked budget if applicable.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerify}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Verify
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function createExpensesColumns(
    userRole: string | null = null
): ColumnDef<Expense>[] {
    const columns: ColumnDef<Expense>[] = [
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
            accessorKey: "receipt_url",
            header: "Receipt",
            cell: ({ row }) => {
                const receiptUrl = row.getValue("receipt_url") as string | null;
                return receiptUrl ? (
                    <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">View</span>
                    </a>
                ) : (
                    <span className="text-muted-foreground">—</span>
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

    // Add actions column only for FINANCE users
    if (userRole === "FINANCE") {
        columns.push({
            id: "actions",
            header: "",
            cell: ({ row }) => {
                return <ExpenseActions expense={row.original} userRole={userRole} />;
            },
            enableSorting: false,
        });
    }

    return columns;
}
