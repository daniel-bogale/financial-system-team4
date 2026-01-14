"use client";

import { useState, useTransition, useRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createExpense, getBudgetsForExpense } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const expenseFormSchema = z.object({
  budget_id: z.string().optional(),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a positive number" }
  ),
  category: z.string().min(1, "Category is required"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseCreateFormProps {
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

const expenseCategories = [
  "Office Supplies",
  "Travel",
  "Meals",
  "Equipment",
  "Software",
  "Utilities",
  "Marketing",
  "Training",
  "Other",
];

export function ExpenseCreateForm({
  open,
  onOpenChange,
  onSuccess,
}: ExpenseCreateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFetchedRef = useRef(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      budget_id: "",
      amount: "",
      category: "",
    },
  });

  const handleOpenChange = async (isOpen: boolean) => {
    onOpenChange(isOpen);

    if (isOpen && !hasFetchedRef.current) {
      setBudgetsLoading(true);
      const result = await getBudgetsForExpense();

      if (result.error) {
        toast.error("Failed to load budgets: " + result.error);
      } else {
        setBudgets(result.data);
      }
      setBudgetsLoading(false);
      hasFetchedRef.current = true;
    }

    if (!isOpen) {
      form.reset();
      setReceiptFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const onSubmit = (values: ExpenseFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (values.budget_id) {
        formData.append("budget_id", values.budget_id);
      }
      formData.append("amount", values.amount);
      formData.append("category", values.category);
      
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const result = await createExpense(null, formData);

      if (result?.error) {
        toast.error("Failed to create expense: " + result.error);
      } else {
        toast.success("Expense created successfully");
        form.reset();
        setReceiptFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense. You can optionally link it to a budget and
            attach a receipt.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budget_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (Optional)</FormLabel>
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
                              : "Select a budget (optional)"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {budgets.length === 0 && !budgetsLoading ? (
                        <SelectItem value="no-budgets" disabled>
                          No approved budgets available
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
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
            <div className="space-y-2">
              <FormLabel>Receipt (Optional)</FormLabel>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isPending}
              />
              {receiptFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {receiptFile.name}
                </p>
              )}
            </div>
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
                Create Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
