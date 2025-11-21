import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CreateMatterForm } from '@/components/matters/create-matter-form'

export default function NewMatterPage() {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Matters', href: '/matters' },
        { label: 'New Matter' },
      ]}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Matter</h1>
          <p className="text-muted-foreground">
            Add a new legal case to your workspace
          </p>
        </div>

        <CreateMatterForm />
      </div>
    </DashboardLayout>
  )
}
