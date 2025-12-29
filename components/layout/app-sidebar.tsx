'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'

import { NavUser } from './nav-user'
import { NavGroup } from './nav-group'
import { useUserProfile } from '@/hooks/use-user-profile'

export function AppSidebar() {
    const { profile } = useUserProfile()
    const user = profile
        ? {
            id: profile.id,
            name: profile.full_name.split("@")[0],
            email: profile.full_name,
            avatar: '', // No avatar in profile, fallback to empty string
            role: profile.role as import('@/lib/types').UserRole | null,
        }
        : sidebarData.user

    // Separate Settings group from other groups
    const settingsGroup = sidebarData.navGroups.find((group) => group.title === 'Settings')
    const mainNavGroups = sidebarData.navGroups.filter((group) => group.title !== 'Settings')

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <div className='flex items-center gap-2 py-1'>
                    <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                        <span className='text-sm font-bold'>F</span>
                    </div>
                    <div className='grid flex-1 text-start text-sm leading-tight'>
                        <span className='truncate font-semibold'>
                            Financial System
                        </span>
                        <span className='truncate text-xs'>Dashboard</span>
                    </div>
                </div>
            </SidebarHeader>
            <div className='pr-4'>
                <SidebarSeparator />
            </div>
            <SidebarContent>
                {mainNavGroups.map((props) => (
                    <NavGroup key={props.title} {...props} />
                ))}
            </SidebarContent>
            <SidebarFooter className='gap-0'>
                {settingsGroup && (
                    <NavGroup {...settingsGroup} />
                )}
                <div className='px-2 py-2'>
                    <NavUser user={user} />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
