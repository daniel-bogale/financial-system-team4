"use client"

import { useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
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
import Link from 'next/link'

export function SignupFormClient() {
    const supabase = createSupabaseBrowserClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const branding = {
        name: "Fin G4",
        logo_url: null,
        description: "Financial Systems"
    }

    const formSchema = z.object({
        email: z.string().email('Please enter a valid email address.'),
        password: z.string().min(6, 'Password must be at least 6 characters.'),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', password: '' },
        mode: 'onTouched',
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            })

            if (error) {
                toast.error('Sign up failed', {
                    description: error.message,
                })
                setLoading(false)
                return
            }

            if (data.user) {
                toast.success('Account created', {
                    description: 'You have been signed up successfully.',
                })
                // Automatically log in the user after signup
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                })
                if (loginError) {
                    toast.error('Auto-login failed', {
                        description: loginError.message,
                    })
                    setLoading(false)
                    router.replace('/login')
                    return
                }
                router.replace('/home')
            }
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
            toast.error('Sign up failed', {
                description: errMsg,
            })
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-lg border-border">
                <CardHeader className=" items-center text-center mb-0">
                    <CardTitle className="text-2xl font-bold ">
                        {branding?.name || 'Sign up'}
                    </CardTitle>
                    <CardDescription />
                    <CardDescription>
                        Create a new account
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
                                        Signing up...
                                    </>
                                ) : (
                                    'Sign up'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center border-t pt-4 gap-2">
                    <p className="text-xs">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary underline">Sign in</Link>
                    </p>
                    <p className="text-xs">
                        Restricted Access &bull; {branding?.name}
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
