import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getUserTenant } from '@/lib/auth/tenant'
import { getMatters } from '@/lib/db/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckSquare, Upload, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const userTenant = await getUserTenant()
  
  // Fetch recent data
  const matters = await getMatters().catch(() => [])
  const recentMatters = matters.slice(0, 5)

  // Calculate stats
  const stats = {
    totalMatters: matters.length,
    activeMatters: matters.filter(m => m.status === 'active').length,
    pendingMatters: matters.filter(m => m.status === 'pending').length,
    closedMatters: matters.filter(m => m.status === 'closed').length,
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your cases today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Matters
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatters}</div>
              <p className="text-xs text-muted-foreground">
                All cases in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Matters
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMatters}</div>
              <p className="text-xs text-muted-foreground">
                Currently being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Matters
              </CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingMatters}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Closed Matters
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedMatters}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matters */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matters</CardTitle>
            <CardDescription>
              Your most recently created cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMatters.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No matters yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating your first matter.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/matters/new">Create Matter</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMatters.map((matter) => (
                  <div
                    key={matter.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/matters/${matter.id}`}
                        className="font-medium hover:underline"
                      >
                        {matter.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {matter.client_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          matter.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : matter.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {matter.status}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/matters">View All Matters</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
