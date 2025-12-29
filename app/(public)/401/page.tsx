
import { UnauthorizedError } from '@/components/errors/unauthorized-error'
import { Suspense } from 'react'

export default function UnauthorizedErrorWithSuspense() {
    return (
        <Suspense fallback={null}>
            <UnauthorizedError />
        </Suspense>
    )
}