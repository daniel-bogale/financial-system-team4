'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewCashRequestPage() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const [budgets, setBudgets] = useState<Array<{ id: string; department?: string | null; created_by?: string | null }>>([])
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [purpose, setPurpose] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [budgetsLoading, setBudgetsLoading] = useState<boolean>(true)
  const [budgetsError, setBudgetsError] = useState<string | null>(null)

  useEffect(() => {
    const loadBudgets = async () => {
      setBudgetsLoading(true)
      setBudgetsError(null)
      try {
        // Fetch budgets with id, department, created_by
        const { data, error } = await supabase.from('budgets').select('id, department, created_by')
        console.log(data);
        if (error) {
          setBudgetsError(error.message)
          setBudgets([])
        } else {
          setBudgets((data as any[])?.map(b => ({ id: b.id})))
        }
      } catch (_) {
        setBudgetsError('Failed to load budgets')
        setBudgets([])
      }
      setBudgetsLoading(false)
    }
    loadBudgets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!selectedBudgetId) {
        setError('Please choose a budget.')
        setLoading(false)
        return
      }
      const payload: any = { amount, purpose }
      // Attach required selected budget id
      payload.budget_id = selectedBudgetId
      const { error } = await supabase.from('cash_requests').insert(payload)
      if (error) throw error
      router.push('/cash-requests')
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">New Cash Request</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Budget <span className="text-red-600">*</span></label>
          {budgetsLoading ? (
            <div className="text-sm text-muted-foreground">Loading budgets...</div>
          ) : budgetsError ? (
            <div className="text-sm text-red-600">{budgetsError}</div>
          ) : budgets.length === 0 ? (
            <div className="text-sm text-muted-foreground">No budgets available or you may not have access.</div>
          ) : (
            <select
              value={selectedBudgetId}
              onChange={(e)=>setSelectedBudgetId(e.target.value)}
              className="w-full border rounded p-2 bg-background"
            >
              <option value="" disabled>Choose a budget...</option>
              {budgets.map((b)=>{
                const label = b.department ?? b.id
                return <option key={b.id} value={b.id}>{label}</option>
              })}
            </select>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm">Amount</label>
          <input type="number" min={0} step="1" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full border rounded p-2 bg-background" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Description</label>
          <textarea value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="w-full border rounded p-2 bg-background" required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={()=>router.back()} className="px-3 py-2 rounded border">Cancel</button>
        </div>
      </form>
    </div>
  )
}
