'use client'

import { useState, useEffect } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { Input } from '@/components/ui/input'

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { isNextRedirectError } from '@/lib/types'


export function LoginFormClient() {
	const supabase = createSupabaseBrowserClient()
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [loading, setLoading] = useState(false)
	const [isVisible, setIsVisible] = useState(false)
	const branding = {
		name: "Fin G4",
		logo_url: null,
		description: "Financial Systems"
	}

	// Check for error parameter and show toast
	useEffect(() => {
		const error = searchParams.get('error')
		if (error === 'access_revoked') {
			toast.error('Access Revoked: Your access has been revoked. Please contact support for assistance.')
			// Clean up the URL by removing the error parameter
			const params = new URLSearchParams(searchParams.toString())
			params.delete('error')
			const newSearch = params.toString()
			router.replace(pathname + (newSearch ? `?${newSearch}` : ''))
		}
	}, [searchParams, router, pathname])

	const formSchema = z.object({
		email: z.string().email('Please enter a valid email address.'),
		password: z.string().min(6, 'Password must be at least 6 characters.'),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '', password: '' },
		mode: 'onTouched',
	})

	// Helper function to get user-friendly error message
	function getErrorMessage(error: { message: string; status?: number } | Error): string {
		const errorMessage = error instanceof Error ? error.message : error.message || ''
		const message = errorMessage.toLowerCase()
		const status = 'status' in error ? error.status : undefined

		// Check for specific error patterns
		if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
			return 'Invalid email or password. Please check your credentials and try again.'
		}
		if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
			return 'Please verify your email address before signing in.'
		}
		if (message.includes('too many requests') || status === 429) {
			return 'Too many sign-in attempts. Please wait a moment and try again.'
		}
		if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
			return 'Network error. Please check your connection and try again.'
		}
		if (message.includes('locked') || message.includes('disabled')) {
			return 'Your account has been temporarily locked. Please contact support.'
		}
		if (status && status >= 500) {
			return 'A server error occurred. Please try again later.'
		}

		// Fallback to original message or generic error
		return errorMessage || 'An unexpected error occurred'
	}

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setLoading(true)
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password,
			})

			if (error) {
				const errorMessage = getErrorMessage(error)
				toast.error(`Sign in failed ${errorMessage ? `: ${errorMessage}` : ''}`)
				setLoading(false)
				return
			}

			if (data.session) {
				toast.success('Signed in successfully')
				try {
					router.replace('/home')
				} catch (redirectError: unknown) {
					// NEXT_REDIRECT error is expected and indicates successful redirect
					if (isNextRedirectError(redirectError)) {
						// This is a successful redirect, no need to show error
						return
					}
					// Re-throw if it's not a redirect error
					throw redirectError
				}
			}
		} catch (error: unknown) {
			// Check if this is a NEXT_REDIRECT error (which is actually success)
			if (isNextRedirectError(error)) {
				// NEXT_REDIRECT is expected behavior for successful redirects
				toast.success('Signed in successfully')
				return
			}

			// Handle actual errors
			const errorMessage = error instanceof Error
				? getErrorMessage(error)
				: 'An unexpected error occurred'
			toast.error('Sign in failed' + (errorMessage ? `: ${errorMessage}` : ''))
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
			<Card className="w-full max-w-sm shadow-lg border-border">
				<CardHeader className=" items-center text-center mb-0">
					<CardTitle className="text-2xl font-bold ">
						{branding?.name || 'Welcome back'}
					</CardTitle>
					<CardDescription />
					<CardDescription>
						Sign in to your account to continue
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email address</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="email"
												placeholder="you@example.com"
												disabled={loading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													{...field}
													type={isVisible ? 'text' : 'password'}
													placeholder="Password"
													disabled={loading}
												/>
												<Button
													type="button"
													variant='ghost'
													size='icon'
													onClick={() => setIsVisible(prevState => !prevState)}
													className='absolute inset-y-0 right-0 h-full px-3 py-2 hover:bg-transparent'
													aria-label={isVisible ? 'Hide password' : 'Show password'}
												>
													{isVisible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Signing in...
									</>
								) : (
									'Sign in'
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col items-center border-t pt-4 gap-2">
					<p className="text-xs">
						Don&apos;t have an account?{' '}
						<a href="/signup" className="text-primary underline">Sign up</a>
					</p>
					<p className="text-xs">
						Restricted Access &bull; {branding?.name}
					</p>
				</CardFooter>
			</Card>
		</div>
	)
}
