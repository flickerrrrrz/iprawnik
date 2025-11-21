'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function SetupUserPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function setupUser() {
    setLoading(true)
    setStatus('Checking authentication...')
    
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setStatus('❌ Error: Not logged in. Please log in first.')
        setLoading(false)
        return
      }

      setStatus(`✓ Logged in as: ${user.email}`)

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingUser) {
        setStatus('✓ User already exists in database. Redirecting...')
        setTimeout(() => window.location.href = '/dashboard', 1000)
        return
      }

      setStatus('Creating tenant...')

      // Create tenant
      const tenantName = user.email?.split('@')[0] + "'s Law Firm"
      const tenantSlug = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '-firm'

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: tenantName,
          slug: tenantSlug
        })
        .select()
        .single()

      if (tenantError) {
        setStatus('❌ Error creating tenant: ' + tenantError.message)
        setLoading(false)
        return
      }

      setStatus(`✓ Created tenant: ${tenant.name}`)

      // Create user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          tenant_id: tenant.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'owner'
        })

      if (userError) {
        setStatus('❌ Error creating user: ' + userError.message)
        setLoading(false)
        return
      }

      setStatus('✅ Success! Redirecting to dashboard...')
      setTimeout(() => window.location.href = '/dashboard', 2000)
      
    } catch (error) {
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Your Account</CardTitle>
          <CardDescription>
            Create your tenant and user profile to get started with Prawnik AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="p-4 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
              {status}
            </div>
          )}
          
          <Button 
            onClick={setupUser} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Setup Account'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Make sure you're logged in before clicking setup
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
