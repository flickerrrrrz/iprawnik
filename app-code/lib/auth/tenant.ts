/**
 * Tenant Management Utilities
 * 
 * Handles multi-tenancy operations including:
 * - Getting user's tenant
 * - Setting tenant context for RLS
 * - Tenant validation
 */

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface UserTenant {
  id: string
  tenant_id: string
  role: 'owner' | 'admin' | 'lawyer' | 'assistant'
  tenant: {
    id: string
    name: string
    slug: string
    subscription_status: 'trial' | 'active' | 'past_due' | 'canceled'
    subscription_plan: 'starter' | 'professional' | 'enterprise'
  }
}

/**
 * Get current user's tenant information
 * Returns null if user is not authenticated or has no tenant
 */
export async function getUserTenant(): Promise<UserTenant | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      tenant_id,
      role,
      tenant:tenants(
        id,
        name,
        slug,
        subscription_status,
        subscription_plan
      )
    `)
    .eq('id', user.id)
    .single()

  if (error || !data) {
    console.error('Error fetching user tenant:', error)
    return null
  }

  return data as unknown as UserTenant
}

/**
 * Set tenant context for Row Level Security
 * This must be called before any tenant-scoped queries
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  const supabase = await createClient()
  
  // Call the database function to set tenant context
  const { error } = await supabase.rpc('set_tenant_context', {
    tenant_id: tenantId
  })

  if (error) {
    console.error('Error setting tenant context:', error)
    throw new Error('Failed to set tenant context')
  }
}

/**
 * Get tenant ID from cookies (set by middleware)
 * This is faster than querying the database
 */
export async function getTenantIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const tenantId = cookieStore.get('tenant_id')?.value
  return tenantId || null
}

/**
 * Verify user has access to tenant
 * Throws error if user doesn't belong to tenant
 */
export async function verifyTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * Check if user has specific role in tenant
 */
export async function hasRole(
  userId: string,
  roles: Array<'owner' | 'admin' | 'lawyer' | 'assistant'>
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return roles.includes(data.role)
}

/**
 * Check if user is owner or admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, ['owner', 'admin'])
}

/**
 * Get all users in tenant
 * Only accessible by owner/admin
 */
export async function getTenantUsers(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      role,
      avatar_url,
      created_at
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tenant users:', error)
    return []
  }

  return data
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching tenant by slug:', error)
    return null
  }

  return data
}
