import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getMatter } from '@/lib/db/actions'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { statusColors } from '@/lib/schemas/matter'
import { formatDistanceToNow } from 'date-fns'

export default async function MatterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  try {
    const matter = await getMatter(id)

    if (!matter) {
      notFound()
    }

    return (
      <DashboardLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Matters', href: '/matters' },
          { label: matter.title },
        ]}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{matter.title}</h1>
              <p className="text-muted-foreground">
                Created{' '}
                {formatDistanceToNow(new Date(matter.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[matter.status as keyof typeof statusColors]}>
                {matter.status}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/matters/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          {/* Client Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Name</h4>
                  <p className="text-muted-foreground">{matter.client_name}</p>
                </div>
                {matter.client_email && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </h4>
                    <p className="text-muted-foreground">{matter.client_email}</p>
                  </div>
                )}
                {matter.client_phone && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </h4>
                    <p className="text-muted-foreground">{matter.client_phone}</p>
                  </div>
                )}
                {matter.client_address && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </h4>
                    <p className="text-muted-foreground">{matter.client_address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Matter Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matter.description && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {matter.description}
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    {matter.matter_type && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Matter Type</h4>
                        <Badge variant="outline">{matter.matter_type}</Badge>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Status</h4>
                      <Badge className={statusColors[matter.status as keyof typeof statusColors]}>
                        {matter.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Upload and manage documents related to this matter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No documents yet. Document management coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    Track and manage tasks for this matter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No tasks yet. Task management coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>
                    View all activity related to this matter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No activity yet. Activity logging coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading matter:', error)
    notFound()
  }
}
