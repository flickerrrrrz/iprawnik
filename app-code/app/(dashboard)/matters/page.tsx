import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getMatters } from '@/lib/db/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { MatterCard } from '@/components/matters/matter-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function MattersPage() {
  const matters = await getMatters()

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Matters' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Matters</h1>
            <p className="text-muted-foreground">
              Manage your legal cases and clients
            </p>
          </div>
          <Button asChild>
            <Link href="/matters/new">
              <Plus className="mr-2 h-4 w-4" />
              New Matter
            </Link>
          </Button>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search matters..."
                  className="pl-8"
                />
              </div>
              {/* TODO: Add status filter dropdown */}
            </div>
          </CardContent>
        </Card>

        {/* Matters List */}
        {matters.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No matters yet</CardTitle>
              <CardDescription>
                Get started by creating your first matter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/matters/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Matter
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matters.map((matter) => (
              <MatterCard key={matter.id} matter={matter} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
