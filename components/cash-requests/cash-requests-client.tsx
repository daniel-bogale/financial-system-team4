"use client";

import { CashRequestsTable } from "./cash-requests-table";
import type { CashRequest } from "./cash-requests-types";

interface CashRequestsClientProps {
    cashRequests: CashRequest[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    isFinance: boolean;
}

export function CashRequestsClient({ cashRequests, pagination, isFinance }: CashRequestsClientProps) {
    return (
        <CashRequestsTable
            data={cashRequests}
            total={pagination.total}
            totalPages={pagination.totalPages}
            isFinance={isFinance}
        />
    );
}
