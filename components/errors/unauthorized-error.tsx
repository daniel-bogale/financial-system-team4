'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function UnauthorizedError() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const supabase = createSupabaseBrowserClient()
    const [countdown, setCountdown] = useState<number | null>(null)

    // Extract locale from pathname (e.g., /en/401 -> en)
    const locale = pathname.split('/')[1] || 'en'

    useEffect(() => {
        const error = searchParams.get('error')
        if (error === 'access_revoked') {
            // Start countdown from 10 seconds
            let remaining = 10
            setCountdown(remaining)

            // Show initial toast with countdown
            const toastId = toast.error('accessRevoked', {
                description: `signingOutIn: ${remaining}`,
                duration: Infinity, // Keep toast visible
            })

            // Update countdown every second
            const interval = setInterval(() => {
                remaining--
                setCountdown(remaining)

                if (remaining > 0) {
                    toast.error('accessRevoked', {
                        id: toastId,
                        description: `signingOutIn: ${remaining}`,
                        duration: Infinity,
                    })
                } else {
                    clearInterval(interval)
                    setCountdown(null)
                    // Sign out after countdown
                    supabase.auth.signOut().then(() => {
                        toast.dismiss(toastId)
                        // Redirect to login with locale
                        router.push(`/${locale}/login`)
                    }).catch((err) => {
                        console.error('Error signing out:', err)
                        toast.dismiss(toastId)
                    })
                }
            }, 1000)

            // Cleanup interval on unmount
            return () => {
                clearInterval(interval)
            }
        }
    }, [searchParams, router, supabase, locale])

    return (
        <div className='h-dvh'>
            <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
                <span className='font-medium'>Unauthorized Access</span>
                <p className='text-muted-foreground text-center'>
                    Please log in with the appropriate credentials <br /> to access this
                    resource.
                </p>
                {countdown !== null && (
                    <p className='text-sm text-muted-foreground mt-2'>
                        {`signingOutIn: ${countdown}`}
                    </p>
                )}
                <div className='mt-6 flex gap-4'>
                    <Button variant='outline' onClick={() => router.back()}>
                        Go Back
                    </Button>
                    <Button onClick={() => router.push('/')}>Back to Home</Button>
                </div>
            </div>
        </div>
    )
}

