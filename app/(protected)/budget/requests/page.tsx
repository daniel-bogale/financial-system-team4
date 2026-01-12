import { Metadata } from 'next'
import { CashRequestsList } from '@/components/budget/cash-requests-list'

export const metadata: Metadata = {
    title: 'Cash Requests',
    description: 'View and manage cash requests'
}

export default function CashRequestsPage() {
    return <CashRequestsList />
}
