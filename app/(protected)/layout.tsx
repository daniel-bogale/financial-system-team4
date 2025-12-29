import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ReactNode } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'

const ProtectedLayout = async ({
    children
}: {
    children: ReactNode;
}) => {
    // TODO: Add your authentication logic here
    // Example: if (!session) redirect('/login')

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className={cn('@container/content', 'has-data-[layout=fixed]:h-dvh', 'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100dvh-(var(--spacing)*4))]')}>
                <Header fixed />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}

export default ProtectedLayout;
