import { AppSidebar } from './app-sidebar'
import { Header } from './header'
import { getUserTenant } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export async function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
  const userTenant = await getUserTenant()

  // Redirect if not authenticated
  if (!userTenant) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        tenantName={userTenant.tenant.name}
        userFullName={userTenant.id}
        userEmail={userTenant.tenant.slug}
      />
      <main className="flex-1">
        <Header breadcrumbs={breadcrumbs} />
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
