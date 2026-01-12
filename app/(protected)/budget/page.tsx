import { Metadata } from 'next'
import { BudgetDashboard } from '@/components/budget/budget-dashboard'

export const metadata: Metadata = {
    title: 'Budget Overview',
    description: 'Budget management dashboard'
}

export default function BudgetPage() {
    return <BudgetDashboard />
}
