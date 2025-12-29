"use client"

import { usePathname } from "next/navigation"
import { Fragment } from "react"
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatBreadcrumb = (path: string) => {
    // Replace hyphens and underscores with spaces, then capitalize
    const formatted = path.replace(/[-_]/g, ' ')
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1)

    // Truncate if too long
    return capitalized.length > 20
        ? `${capitalized.slice(0, 8)}...${capitalized.slice(-8)}`
        : capitalized
}

// List of supported locales to filter out
const LOCALES = ['en', 'nl']

export function DynamicBreadcrumb() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter((path) => path !== "" && !LOCALES.includes(path))

    // Check if we're on a settings sub-page (settings has sub-pages but no main page)
    const isSettingsSubPage = paths[0] === 'settings' && paths.length > 1

    // Helper to check if a path should be non-clickable
    const shouldBeNonClickable = (path: string, index: number) => {
        return path === 'settings' && isSettingsSubPage && index === 0
    }

    // Helper to build href for a path
    const buildHref = (index: number) => {
        return `/${paths.slice(0, index + 1).join('/')}`
    }

    return (
        <Breadcrumb className="flex-1 min-w-0">
            <BreadcrumbList className="flex-nowrap overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                        <Link href="/home" className="whitespace-nowrap">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {paths.length === 0 ? null : paths.length <= 2 ? (
                    // Show all items when there are 2 or fewer paths
                    paths.map((path, index) => {
                        const isLast = index === paths.length - 1
                        const href = buildHref(index)
                        const isNonClickable = shouldBeNonClickable(path, index)

                        return (
                            <Fragment key={index}>
                                <BreadcrumbSeparator className="shrink-0" />
                                <BreadcrumbItem className="shrink-0 min-w-0">
                                    {isLast || isNonClickable ? (
                                        <BreadcrumbPage className="whitespace-nowrap truncate">
                                            {formatBreadcrumb(path)}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href} className="whitespace-nowrap truncate">{formatBreadcrumb(path)}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        )
                    })
                ) : (
                    // For 3+ items, use progressive disclosure
                    <>
                        {/* First item - shown on tablet+ (sm) */}
                        <BreadcrumbSeparator className="shrink-0 hidden sm:block" />
                        <BreadcrumbItem className="shrink-0 hidden sm:flex min-w-0">
                            {shouldBeNonClickable(paths[0], 0) ? (
                                <BreadcrumbPage className="whitespace-nowrap truncate">
                                    {formatBreadcrumb(paths[0])}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={buildHref(0)} className="whitespace-nowrap truncate">
                                        {formatBreadcrumb(paths[0])}
                                    </Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>

                        {/* Second item - shown on desktop (md), only if there are 4+ items */}
                        {paths.length >= 4 && (
                            <>
                                <BreadcrumbSeparator className="shrink-0 hidden md:block" />
                                <BreadcrumbItem className="shrink-0 hidden md:flex min-w-0">
                                    {shouldBeNonClickable(paths[1], 1) ? (
                                        <BreadcrumbPage className="whitespace-nowrap truncate">
                                            {formatBreadcrumb(paths[1])}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={buildHref(1)} className="whitespace-nowrap truncate">
                                                {formatBreadcrumb(paths[1])}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </>
                        )}

                        {/* Third item - shown on large screens (lg), only if there are 5+ items */}
                        {paths.length >= 5 && (
                            <>
                                <BreadcrumbSeparator className="shrink-0 hidden lg:block" />
                                <BreadcrumbItem className="shrink-0 hidden lg:flex min-w-0">
                                    {shouldBeNonClickable(paths[2], 2) ? (
                                        <BreadcrumbPage className="whitespace-nowrap truncate">
                                            {formatBreadcrumb(paths[2])}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={buildHref(2)} className="whitespace-nowrap truncate">
                                                {formatBreadcrumb(paths[2])}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </>
                        )}

                        {/* Ellipsis with dropdown for hidden items */}
                        {/* Show ellipsis when there are middle items to hide (3+ total paths) */}
                        {paths.length >= 3 && (
                            <>
                                <BreadcrumbSeparator className="shrink-0" />
                                <BreadcrumbItem className="shrink-0">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="flex items-center focus:outline-none">
                                            <BreadcrumbEllipsis />
                                            <span className="sr-only">More breadcrumbs</span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            {/* Show all middle items in dropdown (items between first visible and last) */}
                                            {paths.slice(1, -1).map((path, relativeIndex) => {
                                                const actualIndex = relativeIndex + 1
                                                const href = buildHref(actualIndex)
                                                const isNonClickable = shouldBeNonClickable(path, actualIndex)

                                                return (
                                                    <DropdownMenuItem key={actualIndex} asChild disabled={isNonClickable}>
                                                        {isNonClickable ? (
                                                            <span className="cursor-default">{formatBreadcrumb(path)}</span>
                                                        ) : (
                                                            <Link href={href}>{formatBreadcrumb(path)}</Link>
                                                        )}
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </BreadcrumbItem>
                            </>
                        )}

                        {/* Last item - always shown */}
                        <BreadcrumbSeparator className="shrink-0" />
                        <BreadcrumbItem className="shrink-0 min-w-0">
                            <BreadcrumbPage className="whitespace-nowrap truncate">
                                {formatBreadcrumb(paths[paths.length - 1])}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

