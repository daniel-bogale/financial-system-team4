"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import type { CashRequest } from "./cash-requests-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, CheckIcon, XIcon, Loader2, DollarSign, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
    approveCashRequest,
    rejectCashRequest,
    disburseCashRequest,
    deleteCashRequest,
} from "@/lib/actions/cash-requests";
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
import Link from "next/link";

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

function getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
        case "APPROVED":
            return "bg-green-500/10 text-green-700 dark:text-green-400";
        case "PENDING":
            return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
        case "REJECTED":
            return "bg-red-500/10 text-red-700 dark:text-red-400";
        case "DISBURSED":
            return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
        default:
            return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
}

function CashRequestActions({ cashRequest, isFinance }: { cashRequest: CashRequest; isFinance: boolean }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showDisburseDialog, setShowDisburseDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveCashRequest(cashRequest.id);
            if (result?.error) {
                toast.error("Failed to approve: " + result.error);
            } else {
                toast.success("Cash approved successfully");
                router.refresh();
            }
            setShowApproveDialog(false);
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            const result = await rejectCashRequest(cashRequest.id);
            if (result?.error) {
                toast.error("Failed to reject: " + result.error);
            } else {
                toast.success("Cash rejected successfully");
                router.refresh();
            }
            setShowRejectDialog(false);
        });
    };

    const handleDisburse = () => {
        startTransition(async () => {
            const result = await disburseCashRequest(cashRequest.id);
            if (result?.error) {
                toast.error("Failed to disburse: " + result.error);
            } else {
                toast.success("Cash disbursed successfully");
                router.refresh();
            }
            setShowDisburseDialog(false);
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteCashRequest(cashRequest.id);
            if (result?.error) {
                toast.error("Failed to delete: " + result.error);
            } else {
                toast.success("Cash deleted successfully");
                router.refresh();
            }
            setShowDeleteDialog(false);
        });
    };

    const isPendingStatus = cashRequest.status === "PENDING";
    const isApprovedStatus = cashRequest.status === "APPROVED";
    const hasActions = isFinance || isPendingStatus;

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
                    <DropdownMenuItem asChild>
                        <Link href={`/cash/${cashRequest.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </Link>
                    </DropdownMenuItem>

                    {isFinance && isPendingStatus && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowApproveDialog(true)}
                                className="text-green-700 focus:text-green-800 focus:bg-green-50 dark:text-green-400 dark:focus:bg-green-950"
                            >
                                <CheckIcon className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowRejectDialog(true)}
                                className="text-red-700 focus:text-red-800 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-950"
                            >
                                <XIcon className="mr-2 h-4 w-4" />
                                Reject
                            </DropdownMenuItem>
                        </>
                    )}

                    {isFinance && isApprovedStatus && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDisburseDialog(true)}
                                className="text-blue-700 focus:text-blue-800 focus:bg-blue-50 dark:text-blue-400 dark:focus:bg-blue-950"
                            >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Disburse
                            </DropdownMenuItem>
                        </>
                    )}

                    {hasActions && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-red-700 focus:text-red-800 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-950"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Cash</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve this cash for{" "}
                            <strong>{formatCurrency(cashRequest.amount)}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Cash</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject this cash for{" "}
                            <strong>{formatCurrency(cashRequest.amount)}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Disburse Confirmation Dialog */}
            <AlertDialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disburse Cash</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to disburse{" "}
                            <strong>{formatCurrency(cashRequest.amount)}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDisburse}
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Disburse
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Cash</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this cash entry? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function createCashRequestsColumns(isFinance: boolean): ColumnDef<CashRequest>[] {
    return [
        {
            accessorKey: "purpose",
            header: "Purpose",
            cell: ({ row }) => {
                const purpose = row.getValue("purpose") as string | null;
                return (
                    <span className="font-medium max-w-50 truncate block">
                        {purpose || "—"}
                    </span>
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge className={cn("capitalize", getStatusColor(status))}>
                        {status.toLowerCase()}
                    </Badge>
                );
            },
            enableSorting: true,
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true;
                return value.includes(row.getValue(id));
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
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                return <CashRequestActions cashRequest={row.original} isFinance={isFinance} />;
            },
            enableSorting: false,
        },
    ];
}
