'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCashRequests, type CashRequest } from '@/lib/api/cash-requests'
import { useUserProfile } from '@/hooks/use-user-profile'

export function BudgetDashboard() {
    const [requests, setRequests] = useState<CashRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { profile } = useUserProfile()

    useEffect(() => {
        async function loadRequests() {
            try {
                const data = await getCashRequests()
                setRequests(data)
            } catch (error) {
                console.error('Failed to load requests:', error)
            } finally {
                setLoading(false)
            }
        }

        loadRequests()
    }, [])

    const stats = {
        total: requests.reduce((sum, req) => sum + req.amount, 0),
        pending: requests.filter(req => req.status === 'PENDING').length,
        approved: requests.filter(req => req.status === 'APPROVED').length,
        disbursed: requests.filter(req => req.status === 'DISBURSED').length,
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Budget Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your financial requests and budget status
                    </p>
                </div>
                <Button asChild>
                    <Link href="/budget/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.total.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.disbursed}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full justify-start">
                            <Link href="/budget/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Request
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/budget/requests">
                                <DollarSign className="mr-2 h-4 w-4" />
                                View All Requests
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Loading...</p>
                        ) : requests.length === 0 ? (
                            <p className="text-muted-foreground">No requests found</p>
                        ) : (
                            <div className="space-y-2">
                                {requests.slice(0, 5).map((request) => (
                                    <div key={request.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">${request.amount.toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                {request.purpose}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                        }`}>
                      {request.status}
                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
