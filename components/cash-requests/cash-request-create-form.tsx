"use client";

import { useState, useTransition, useRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createCashRequest, getBudgetsForCashRequest } from "@/lib/actions/cash-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const cashRequestFormSchema = z.object({
    budget_id: z.string().min(1, "Budget is required"),
    amount: z.string().min(1, "Amount is required").refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        },
        { message: "Amount must be a positive number" }
    ),
    purpose: z.string().min(1, "Purpose is required"),
});

type CashRequestFormValues = z.infer<typeof cashRequestFormSchema>;

interface CashRequestCreateFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface Budget {
    id: string;
    department: string | null;
    amount?: number;
    used?: number;
    status?: string;
}

export function CashRequestCreateForm({
    open,
    onOpenChange,
    onSuccess,
}: CashRequestCreateFormProps) {
    const [isPending, startTransition] = useTransition();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetsLoading, setBudgetsLoading] = useState(false);
    const hasFetchedRef = useRef(false);

    const form = useForm<CashRequestFormValues>({
        resolver: zodResolver(cashRequestFormSchema),
        defaultValues: {
            budget_id: "",
            amount: "",
            purpose: "",
        },
    });

    const handleOpenChange = async (isOpen: boolean) => {
        onOpenChange(isOpen);

        if (isOpen && !hasFetchedRef.current) {
            setBudgetsLoading(true);
            const result = await getBudgetsForCashRequest();

            if (result.error) {
                toast.error("Failed to load budgets: " + result.error);
            } else {
                setBudgets(result.data);
            }
            setBudgetsLoading(false);
            hasFetchedRef.current = true;
        }
    };

    const onSubmit = (values: CashRequestFormValues) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("budget_id", values.budget_id);
            formData.append("amount", values.amount);
            formData.append("purpose", values.purpose);

            const result = await createCashRequest(null, formData);

            if (result?.error) {
                toast.error("Failed to create cash request: " + result.error);
            } else {
                toast.success("Cash request created successfully");
                form.reset();
                onOpenChange(false);
                onSuccess?.();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>New Cash Request</DialogTitle>
                    <DialogDescription>
                        Submit a new cash request. Select a budget and provide the amount
                        and purpose for the request.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="budget_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={budgetsLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        budgetsLoading
                                                            ? "Loading budgets..."
                                                            : "Select a budget"
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {budgets.length === 0 && !budgetsLoading ? (
                                                <SelectItem value="no-budgets" disabled>
                                                    No budgets available
                                                </SelectItem>
                                            ) : (
                                                budgets.map((budget) => (
                                                    <SelectItem key={budget.id} value={budget.id}>
                                                        {budget.department || budget.id}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the purpose of this cash request"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || budgetsLoading}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Cash Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
