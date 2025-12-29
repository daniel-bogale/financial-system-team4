import { Suspense } from 'react'
import { LoginFormClient } from './login-form-client'

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginFormClient />
		</Suspense>
	)
}
