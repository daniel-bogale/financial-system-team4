export interface CashRequest {
    id: string
    budget_id: string | null
    amount: number
    purpose: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED'
    created_by: string
    created_at: string
    updated_at: string
}

export interface CreateCashRequestData {
    budget_id: string | null
    amount: number
    purpose: string
}

export async function getCashRequests(): Promise<CashRequest[]> {
    const res = await fetch('/api/cash-requests', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
    })
    if (!res.ok) {
        const body = await safeJson(res)
        throw new Error(`Failed to fetch cash requests: ${body?.error ?? res.statusText}`)
    }
    return (await res.json()) as CashRequest[]
}

export async function createCashRequest(requestData: CreateCashRequestData): Promise<CashRequest> {
    const res = await fetch('/api/cash-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(requestData),
    })
    if (!res.ok) {
        const body = await safeJson(res)
        throw new Error(`Failed to create cash request: ${body?.error ?? res.statusText}`)
    }
    return (await res.json()) as CashRequest
}

export async function updateCashRequestStatus(id: string, status: string): Promise<CashRequest> {
    const res = await fetch(`/api/cash-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status }),
    })
    if (!res.ok) {
        const body = await safeJson(res)
        throw new Error(`Failed to update cash request: ${body?.error ?? res.statusText}`)
    }
    return (await res.json()) as CashRequest
}

export async function updateCashRequest(id: string, updates: Partial<CreateCashRequestData>): Promise<CashRequest> {
    const res = await fetch(`/api/cash-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(updates),
    })
    if (!res.ok) {
        const body = await safeJson(res)
        throw new Error(`Failed to update cash request: ${body?.error ?? res.statusText}`)
    }
    return (await res.json()) as CashRequest
}

export async function deleteCashRequest(id: string): Promise<void> {
    const res = await fetch(`/api/cash-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) {
        const body = await safeJson(res)
        throw new Error(`Failed to delete cash request: ${body?.error ?? res.statusText}`)
    }
}

async function safeJson(res: Response) {
    try {
        return await res.json()
    } catch {
        return null
    }
}
