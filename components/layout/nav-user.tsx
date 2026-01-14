'use client'

import Link from 'next/link'
import {
    BadgeCheck,
    ChevronsUpDown,
    LogOut,
} from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '../sign-out-dialog'
import { Profile } from '@/hooks/use-user-profile'

type NavUserProps = {
    user: Profile
}

export function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar()
    const [open, setOpen] = useDialogState<boolean>()

    const formatRole = (role: string | null | undefined) => {
        if (!role) return 'Staff'
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size='lg'
                                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                            >
                                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-xs'>
                                    <Avatar className='h-8 w-8 rounded-none'>
                                        <AvatarImage src={user.avatar || undefined} alt={user?.full_name || ''} />
                                        <AvatarFallback className='rounded-none'>{getInitials(user?.full_name || '')}</AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 text-start text-xs leading-tight min-w-0'>
                                        <div className='flex items-center gap-2 min-w-0'>
                                            <span className='truncate font-semibold flex-1 min-w-0'>{user.full_name}</span>
                                            {user.role && (
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                                                    {formatRole(user.role)}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className='truncate text-xs'>{user.email}</span>
                                    </div>
                                </div>
                                <ChevronsUpDown className='ms-auto size-4' />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='w-(--radix-dropdown-menu-trigger-width) min-w-56'
                            side={isMobile ? 'bottom' : 'right'}
                            align='end'
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className='p-0 font-normal'>
                                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-xs'>
                                    <Avatar className='h-8 w-8 rounded-none'>
                                        <AvatarImage src={user.avatar || undefined} alt={user?.full_name || ''} />
                                        <AvatarFallback className='rounded-none'>{getInitials(user?.full_name || '')}</AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 text-start text-xs leading-tight min-w-0'>
                                        <div className='flex items-center gap-2 min-w-0'>
                                            <span className='truncate font-semibold flex-1 min-w-0'>{user.full_name}</span>
                                            {user.role && (
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                                                    {formatRole(user.role)}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className='truncate text-xs'>{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href='/settings'>
                                        <BadgeCheck />
                                        Account
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator /> */}
                            <DropdownMenuItem
                                variant='destructive'
                                onClick={() => setOpen(true)}
                            >
                                <LogOut />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    )
}
