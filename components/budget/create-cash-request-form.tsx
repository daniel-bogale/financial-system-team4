
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCashRequest } from '@/lib/api/cash-requests'

const createCashRequestSchema = z.object({
    budget_id: z.string().optional(),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    purpose: z.string().min(5, 'Purpose must be at least 5 characters'),
})

type CreateCashRequestForm = z.infer<typeof createCashRequestSchema>

export function CreateCashRequestForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<CreateCashRequestForm>({
        resolver: zodResolver(createCashRequestSchema),
        defaultValues: {
            amount: 0,
            purpose: '',
            budget_id: undefined,
        },
    })

    async function onSubmit(data: CreateCashRequestForm) {
        try {
            setIsLoading(true)
            await createCashRequest({
                amount: data.amount,
                purpose: data.purpose,
                budget_id: data.budget_id || null,
            })

            toast.success('Cash request created successfully')
            router.push('/budget/requests')
        } catch (error) {
            toast.error('Failed to create cash request')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the purpose of this cash request..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="budget_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget (Optional)</FormLabel>
                                    <Select
  onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)}
  value={field.value ?? 'none'}
>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="Select a budget (optional)" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    <SelectItem value="none">No specific budget</SelectItem>
    {/* Add budget options here */}
  </SelectContent>
</Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/budget/requests')}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Request
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
