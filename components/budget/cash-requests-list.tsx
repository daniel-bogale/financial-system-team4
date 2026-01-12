'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, Edit, Trash2, Check, X } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
    getCashRequests,
    updateCashRequestStatus,
    deleteCashRequest,
    type CashRequest
} from '@/lib/api/cash-requests'
import { useUserProfile } from '@/hooks/use-user-profile'

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DISBURSED: 'bg-blue-100 text-blue-800',
}

export function CashRequestsList() {
    const [requests, setRequests] = useState<CashRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { profile } = useUserProfile()
    const isFinance = profile?.role === 'FINANCE'

    useEffect(() => {
        loadRequests()
    }, [])

    async function loadRequests() {
        try {
            const data = await getCashRequests()
            setRequests(data)
        } catch (error) {
            toast.error('Failed to load cash requests')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusUpdate(id: string, status: string) {
        try {
            await updateCashRequestStatus(id, status)
            toast.success(`Request ${status.toLowerCase()} successfully`)
            loadRequests()
        } catch (error) {
            toast.error(`Failed to ${status.toLowerCase()} request`)
            console.error(error)
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteCashRequest(id)
            toast.success('Request deleted successfully')
            loadRequests()
        } catch (error) {
            toast.error('Failed to delete request')
            console.error(error)
        }
    }

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Cash Requests</h1>
                    <p className="text-muted-foreground">
                        {isFinance ? 'Manage all cash requests' : 'View your cash requests'}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/budget/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Amount</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                {isFinance && <TableHead>Created By</TableHead>}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">
                                        ${request.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {request.purpose}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    {isFinance && (
                                        <TableCell>{request.created_by}</TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {/* Finance actions */}
                                            {isFinance && request.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {isFinance && request.status === 'APPROVED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(request.id, 'DISBURSED')}
                                                >
                                                    Disburse
                                                </Button>
                                            )}

                                            {/* Delete action */}
                                            {((isFinance) ||
                                                (request.created_by === profile?.id && request.status === 'PENDING')) && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this cash request?
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(request.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
