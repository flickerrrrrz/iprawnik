/**
 * Database Actions with Tenant Context
 * 
 * All actions automatically scope queries to the current tenant
 * using Row Level Security (RLS) policies.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserTenant, setTenantContext } from '@/lib/auth/tenant'
import { revalidatePath } from 'next/cache'

/**
 * Ensure tenant context is set before running query
 * This is required for RLS to work properly
 */
async function withTenantContext<T>(
  callback: () => Promise<T>
): Promise<T> {
  const userTenant = await getUserTenant()
  
  if (!userTenant) {
    throw new Error('User not authenticated or no tenant found')
  }

  // Set tenant context for RLS
  await setTenantContext(userTenant.tenant_id)

  return callback()
}

// ============================================================================
// MATTERS (Sprawy)
// ============================================================================

export interface CreateMatterInput {
  title: string
  description?: string
  client_name: string
  client_email?: string
  client_phone?: string
  status?: 'active' | 'pending' | 'closed' | 'archived'
  matter_type?: string
  assigned_to?: string
}

export async function createMatter(input: CreateMatterInput) {
  return withTenantContext(async () => {
    const supabase = await createClient()
    const userTenant = await getUserTenant()

    const { data, error } = await supabase
      .from('matters')
      .insert({
        ...input,
        tenant_id: userTenant!.tenant_id,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/matters')
    return data
  })
}

export async function getMatters() {
  return withTenantContext(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('matters')
      .select(`
        *,
        assigned:users!matters_assigned_to_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  })
}

export async function getMatter(id: string) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('matters')
      .select(`
        *,
        assigned:users!matters_assigned_to_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        documents:documents(
          id,
          title,
          file_name,
          file_size,
          status,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  })
}

export async function updateMatter(id: string, updates: Partial<CreateMatterInput>) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('matters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/matters')
    revalidatePath(`/matters/${id}`)
    return data
  })
}

export async function deleteMatter(id: string) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('matters')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/matters')
  })
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export interface CreateDocumentInput {
  matter_id: string
  title: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  description?: string
}

export async function createDocument(input: CreateDocumentInput) {
  return withTenantContext(async () => {
    const supabase = await createClient()
    const userTenant = await getUserTenant()

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...input,
        tenant_id: userTenant!.tenant_id,
        uploaded_by: userTenant!.id,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/documents')
    revalidatePath(`/matters/${input.matter_id}`)
    return data
  })
}

export async function getDocuments(matterId?: string) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    let query = supabase
      .from('documents')
      .select(`
        *,
        matter:matters(
          id,
          title,
          client_name
        ),
        uploader:users!documents_uploaded_by_fkey(
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (matterId) {
      query = query.eq('matter_id', matterId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  })
}

// ============================================================================
// SEARCH
// ============================================================================

export async function searchMatters(query: string) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .rpc('search_matters', { search_query: query })

    if (error) throw error
    return data
  })
}

export async function searchDocuments(query: string) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .rpc('search_document_chunks', { search_query: query })

    if (error) throw error
    return data
  })
}

// ============================================================================
// TASKS (Legal Task Engine)
// ============================================================================

export interface CreateTaskInput {
  matter_id: string
  task_type: string
  title: string
  description?: string
  prompt_template?: string
  config?: Record<string, any>
}

export async function createTask(input: CreateTaskInput) {
  return withTenantContext(async () => {
    const supabase = await createClient()
    const userTenant = await getUserTenant()

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...input,
        tenant_id: userTenant!.tenant_id,
        created_by: userTenant!.id,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/tasks')
    return data
  })
}

export async function getTasks(matterId?: string) {
  return withTenantContext(async () => {
    const supabase = await createClient()

    let query = supabase
      .from('tasks')
      .select(`
        *,
        matter:matters(
          id,
          title
        ),
        creator:users!tasks_created_by_fkey(
          id,
          full_name
        ),
        runs:task_runs(
          id,
          status,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (matterId) {
      query = query.eq('matter_id', matterId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  })
}
