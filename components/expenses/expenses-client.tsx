"use client";

import { ExpensesTable } from "./expenses-table";
import type { Expense } from "./expenses-types";

interface ExpensesClientProps {
    expenses: Expense[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export function ExpensesClient({ expenses, pagination }: ExpensesClientProps) {
    return (
        <ExpensesTable
            data={expenses}
            total={pagination.total}
            totalPages={pagination.totalPages}
        />
    );
}
