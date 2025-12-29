import { Suspense } from 'react'
import { SignupFormClient } from './signup-form-client'

export default function SignupPage() {
    return (
        <Suspense fallback={null}>
            <SignupFormClient />
        </Suspense>
    )
}
