// Copy and paste this into Chrome DevTools console while logged in
// This will create tenant and user record for the logged-in user

(async () => {
  // Import Supabase client
  const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2')
  
  const supabase = createClient(
    'https://tskfjodbbnaozfmctjne.supabase.co',
    'sb_publishable_wU-erO71HyX8SQweE_zdvg_08Ld_Abs'
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('❌ Not logged in!')
    return
  }
  
  console.log('✓ Logged in as:', user.email, user.id)
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()
    
  if (existing) {
    console.log('✓ User already exists in database')
    return
  }
  
  console.log('Creating tenant...')
  
  // Create tenant
  const tenantName = user.email.split('@')[0] + "'s Law Firm"
  const tenantSlug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '-firm'
  
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: tenantName,
      slug: tenantSlug
    })
    .select()
    .single()
    
  if (tenantError) {
    console.error('❌ Error creating tenant:', tenantError)
    return
  }
  
  console.log('✓ Created tenant:', tenant.name, tenant.id)
  
  // Create user
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      tenant_id: tenant.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'owner'
    })
    
  if (userError) {
    console.error('❌ Error creating user:', userError)
    return
  }
  
  console.log('✓ Created user!')
  console.log('✅ Done! Refreshing page in 2 seconds...')
  
  setTimeout(() => window.location.reload(), 2000)
})()
