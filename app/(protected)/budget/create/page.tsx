import { Metadata } from 'next'
import { CreateCashRequestForm } from '@/components/budget/create-cash-request-form'

export const metadata: Metadata = {
    title: 'Create Cash Request',
    description: 'Create a new cash request'
}

export default function CreateCashRequestPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create Cash Request</h1>
                <p className="text-muted-foreground">
                    Submit a new cash request for approval
                </p>
            </div>
            <CreateCashRequestForm />
        </div>
    )
}
