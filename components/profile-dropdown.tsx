import Link from 'next/link'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import type { UserProfile } from '@/lib/types'

type ProfileDropdownProps = {
    user?: UserProfile
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
    const [open, setOpen] = useDialogState()

    // Generate initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const formatRole = (role: string | null | undefined) => {
        if (!role) return 'Staff'
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const displayName = user?.name || 'User'
    const displayEmail = user?.email || 'user@example.com'
    const displayAvatar = user?.avatar || ''
    const displayRole = user?.role
    const initials = getInitials(displayName)

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full' suppressHydrationWarning>
                        <Avatar className='h-8 w-8'>
                            <AvatarImage src={displayAvatar} alt={displayName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-64' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col gap-1.5'>
                            <div className='flex items-center justify-between gap-2'>
                                <p className='text-sm leading-none font-medium'>{displayName}</p>
                                {displayRole && (
                                    <Badge variant="secondary" className="text-xs">
                                        {formatRole(displayRole)}
                                    </Badge>
                                )}
                            </div>
                            <p className='text-muted-foreground text-xs leading-none'>
                                {displayEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href='/settings/account'>
                                Account
                                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator /> */}
                    <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
                        Sign out
                        <DropdownMenuShortcut className='text-current'>
                            ⇧⌘Q
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    )
}
