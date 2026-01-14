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
    userRole?: string | null;
}

export function ExpensesClient({ expenses, pagination, userRole }: ExpensesClientProps) {
    return (
        <ExpensesTable
            data={expenses}
            total={pagination.total}
            totalPages={pagination.totalPages}
            userRole={userRole}
        />
    );
}
