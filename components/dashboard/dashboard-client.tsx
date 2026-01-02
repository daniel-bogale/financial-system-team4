"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/lib/actions/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface DashboardClientProps {
    stats: DashboardStats;
}

export function DashboardClient({ stats }: DashboardClientProps) {
    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.expenses.amount)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.expenses.total} total records
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.budgets.amount)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.budgets.total} total records
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Cash Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.cashRequests.amount)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.cashRequests.total} total records
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Expenses */}
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Expenses</CardTitle>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/expenses">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">View all expenses</span>
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.expenses.recent.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>
                                                <div className="font-medium">{expense.category}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(expense.created_at), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(expense.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.expenses.recent.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                No recent expenses
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Recent Budgets */}
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Budgets</CardTitle>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/budgets">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">View all budgets</span>
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.budgets.recent.map((budget) => (
                                        <TableRow key={budget.id}>
                                            <TableCell>
                                                <div className="font-medium">{budget.department}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(budget.created_at), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(budget.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.budgets.recent.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                No recent budgets
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Recent Cash Requests */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Cash Requests</CardTitle>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/cash">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">View all cash requests</span>
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.cashRequests.recent.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="font-medium">{request.purpose}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(request.created_at), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(request.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.cashRequests.recent.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                No recent requests
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
