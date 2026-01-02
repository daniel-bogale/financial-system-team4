"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import type { Budget } from "./budgets-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, CheckIcon, XIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { approveBudget, rejectBudget } from "@/lib/actions/budgets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "REJECTED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
}

function BudgetActions({ budget }: { budget: Budget }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveBudget(budget.id);
      if (result?.error) {
        toast.error("Failed to approve budget" + (result.error ? `: ${result.error}` : ''));
      } else {
        toast.success("Budget approved successfully");
        router.refresh();
      }
      setShowApproveDialog(false);
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectBudget(budget.id);
      if (result?.error) {
        toast.error("Failed to reject budget" + (result.error ? `: ${result.error}` : ''));
      } else {
        toast.success("Budget rejected successfully");
        router.refresh();
      }
      setShowRejectDialog(false);
    });
  };

  const isPendingStatus = budget.status === "PENDING";
  const isDisabled = !isPendingStatus || isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isDisabled}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        {isPendingStatus && (
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setShowApproveDialog(true)}
              className="text-green-700 focus:text-green-800 focus:bg-green-50 dark:text-green-400 dark:focus:bg-green-950"
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowRejectDialog(true)}
              variant="destructive"
              className="text-red-700 focus:text-red-800 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-950"
            >
              <XIcon className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this budget for{" "}
              <strong>{budget.department}</strong> ({budget.period})? This
              action will set the budget status to Approved.
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this budget for{" "}
              <strong>{budget.department}</strong> ({budget.period})? This
              action will set the budget status to Rejected and cannot be
              undone.
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function createBudgetsColumns(
  userRole: string | null
): ColumnDef<Budget>[] {
  const columns: ColumnDef<Budget>[] = [
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("department")}</div>
      ),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => <div>{row.getValue("period")}</div>,
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        return <div className="text-right">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "used",
      header: () => <div className="text-right">Used</div>,
      cell: ({ row }) => {
        const used = row.getValue("used") as number;
        const amount = row.original.amount;
        const usagePercentage = (used / amount) * 100;
        return (
          <div className="text-right">
            {formatCurrency(used)}
            <span className="ml-2 text-xs text-muted-foreground">
              ({usagePercentage.toFixed(1)}%)
            </span>
          </div>
        );
      },
    },
    {
      id: "remaining",
      header: () => <div className="text-right">Remaining</div>,
      cell: ({ row }) => {
        const remaining = row.original.amount - row.original.used;
        return <div className="text-right">{formatCurrency(remaining)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={cn(getStatusColor(status))}>{status}</Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <div>{formatDate(date)}</div>;
      },
    },
  ];

  // Add actions column only for FINANCE users
  if (userRole === "FINANCE") {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <BudgetActions budget={row.original} />,
    });
  }

  return columns;
}

