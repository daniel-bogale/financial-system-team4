'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useUserProfile } from '@/hooks/use-user-profile'

export default function CashRequestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()
  const { profile } = useUserProfile()
  const isFinance = profile?.role === 'FINANCE'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [purpose, setPurpose] = useState<string>('')
  const [budgetId, setBudgetId] = useState<string>('')
  const [status, setStatus] = useState<'PENDING'|'APPROVED'|'REJECTED'|'DISBURSED'>('PENDING')
  const [createdAt, setCreatedAt] = useState<string>('')

  const canEditFields = isFinance || status === 'PENDING'

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('cash_requests')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setAmount(data.amount)
      setPurpose(data.purpose ?? '')
      setBudgetId(data.budget_id ?? '')
      setStatus(data.status)
      setCreatedAt(data.created_at)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function save() {
    try {
      setError(null)
      const payload: any = { amount, purpose }
      const { error } = await supabase
        .from('cash_requests')
        .update(payload)
        .eq('id', id)
      if (error) throw error
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? 'Failed to save')
    }
  }

  async function setReqStatus(next: typeof status) {
    try {
      setError(null)
      let query = supabase.from('cash_requests').update({ status: next }).eq('id', id)
      if (next === 'DISBURSED') {
        query = supabase.from('cash_requests').update({ status: next }).eq('id', id).eq('status', 'APPROVED')
      }
      const { error } = await query
      if (error) throw error
      await load()
    } catch (e: any) {
      setError(e.message ?? 'Failed to update status')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return (
    <div className="space-y-2">
      <div className="text-sm text-red-600">{error}</div>
      <button onClick={load} className="px-2 py-1 text-sm rounded bg-muted">Retry</button>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Cash Request</h1>
      <div className="text-sm text-muted-foreground">ID: {id}</div>
      <div className="text-sm">Created at: {new Date(createdAt).toLocaleString()}</div>

      <div className="grid gap-4">
        <div className="space-y-1">
          <label className="text-sm">Budget ID</label>
          <input readOnly disabled value={budgetId} className="w-full border rounded p-2 bg-muted text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Amount</label>
          <input disabled={!canEditFields} type="number" min={0} step="1" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full border rounded p-2 bg-background" />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Purpose</label>
          <textarea disabled={!canEditFields} value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="w-full border rounded p-2 bg-background" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Status:</span>
        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs">{status}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {canEditFields && (
          <button onClick={save} className="px-3 py-2 rounded bg-primary text-primary-foreground">Save</button>
        )}
        <button onClick={()=>router.back()} className="px-3 py-2 rounded border">Back</button>

        {isFinance && status === 'PENDING' && (
          <>
            <button onClick={()=>setReqStatus('APPROVED')} className="px-3 py-2 rounded bg-green-600 text-white">Approve</button>
            <button onClick={()=>setReqStatus('REJECTED')} className="px-3 py-2 rounded bg-red-600 text-white">Reject</button>
          </>
        )}
        {isFinance && status === 'APPROVED' && (
          <button onClick={()=>setReqStatus('DISBURSED')} className="px-3 py-2 rounded bg-blue-600 text-white">Disburse</button>
        )}
      </div>
    </div>
  )
}
