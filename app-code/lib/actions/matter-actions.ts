'use server'

import { createMatter } from '@/lib/db/actions'
import { createMatterSchema, type CreateMatterInput } from '@/lib/schemas/matter'
import { revalidatePath } from 'next/cache'
import { getUserTenant } from '@/lib/auth/tenant'

export async function createMatterAction(input: CreateMatterInput) {
  try {
    // Verify user is authenticated
    const userTenant = await getUserTenant()
    if (!userTenant) {
      return { error: 'Not authenticated' }
    }

    // Validate input
    const parsed = createMatterSchema.safeParse(input)
    if (!parsed.success) {
      return { error: 'Invalid input data' }
    }

    // Create matter with tenant context
    const matter = await createMatter(parsed.data)

    // Revalidate relevant paths
    revalidatePath('/matters')
    revalidatePath('/dashboard')

    return { success: true, matter }
  } catch (error) {
    console.error('Failed to create matter:', error)
    return { error: 'Failed to create matter. Please try again.' }
  }
}
