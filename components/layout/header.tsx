'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useUserProfile } from '@/hooks/use-user-profile'
import { Fragment } from 'react'

export type BreadcrumbItemType = {
    label: string
    href?: string
}

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean
    ref?: React.Ref<HTMLElement>
    breadcrumbs?: BreadcrumbItemType[]
}


export function Header({
    className,
    fixed,
    children,
    breadcrumbs,
    ...props
}: HeaderProps) {
    const [offset, setOffset] = useState(0)
    const { profile } = useUserProfile()
    const user = profile
        ? {
            id: profile.id,
            name: profile.full_name.split("@")[0],
            email: profile.full_name,
            avatar: '',
            role: profile.role as import('@/lib/types').UserRole | null,
        }
        : undefined

    useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop)
        }
        document.addEventListener('scroll', onScroll, { passive: true })
        return () => document.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header
            className={cn(
                'z-50 h-16',
                fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
                offset > 10 && fixed ? 'shadow' : 'shadow-none',
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    'relative flex h-full items-center gap-3 p-4 sm:gap-4 min-w-0',
                    offset > 10 &&
                    fixed &&
                    'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
                )}
            >
                <SidebarTrigger variant='outline' className='max-md:scale-125 shrink-0' />
                <Separator orientation='vertical' className='h-6 shrink-0' />

                {breadcrumbs && breadcrumbs.length > 0 ? (
                    <Breadcrumb className="min-w-0">
                        <BreadcrumbList className="nowrap">
                            {breadcrumbs.length > 2 ? (
                                <>
                                    <BreadcrumbItem className="shrink-0 min-w-0">
                                        {breadcrumbs[0].href ? (
                                            <BreadcrumbLink asChild>
                                                <Link href={breadcrumbs[0].href} className="whitespace-nowrap">{breadcrumbs[0].label}</Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage className="whitespace-nowrap truncate">{breadcrumbs[0].label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="shrink-0" />
                                    <BreadcrumbItem className="shrink-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-1">
                                                <BreadcrumbEllipsis className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                {breadcrumbs.slice(1, -1).map((item, index) => (
                                                    <DropdownMenuItem key={index} asChild>
                                                        {item.href ? (
                                                            <Link href={item.href}>
                                                                {item.label}
                                                            </Link>
                                                        ) : (
                                                            <span>{item.label}</span>
                                                        )}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="shrink-0" />
                                    <BreadcrumbItem className="shrink-0 min-w-0">
                                        <BreadcrumbPage className="whitespace-nowrap truncate">{breadcrumbs[breadcrumbs.length - 1].label}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            ) : (
                                breadcrumbs.map((item, index) => {
                                    const isLast = index === breadcrumbs.length - 1
                                    return (
                                        <Fragment key={index}>
                                            <BreadcrumbItem className="shrink-0 min-w-0">
                                                {isLast ? (
                                                    <BreadcrumbPage className="whitespace-nowrap truncate">{item.label}</BreadcrumbPage>
                                                ) : item.href ? (
                                                    <BreadcrumbLink asChild>
                                                        <Link href={item.href} className="whitespace-nowrap">{item.label}</Link>
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage className="whitespace-nowrap truncate">{item.label}</BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {!isLast && <BreadcrumbSeparator className="shrink-0" />}
                                        </Fragment>
                                    )
                                })
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                ) : null}
                {children}
                <div className="hidden sm:block">
                    <ProfileDropdown user={user} />
                </div>
            </div>
        </header>
    )
}
