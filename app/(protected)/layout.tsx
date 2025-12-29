import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ReactNode } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb'
import { Main } from '@/components/layout/main'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'


async function getSession() {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getSession()
    return data.session
}

const ProtectedLayout = async ({
    children,
}: {
    children: ReactNode;
}) => {
    const session = await getSession()

    if (!session) redirect(`/login`)

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className={cn('@container/content', 'has-data-[layout=fixed]:h-dvh', 'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100dvh-(var(--spacing)*4))]')}>
                <Header fixed>
                    <DynamicBreadcrumb />
                </Header>
                <Main>
                    {children}
                </Main>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default ProtectedLayout;
