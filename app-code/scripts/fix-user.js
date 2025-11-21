// Script to create tenant and user for logged in user
// Run this script while logged in to automatically create your tenant
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '***' + supabaseKey.slice(-4) : 'missing')

async function fixUser() {
  // This will use the logged-in user's session from browser
  console.log('\n⚠️  Please run this code in your browser console while logged in!\n')
  console.log('Copy and paste this into browser console:\n')
  
  const browserScript = `
// Create tenant and user for current logged-in user
(async () => {
  const supabase = window.supabaseClient || (() => {
    throw new Error('Supabase client not found. Make sure you are on the app page.');
  })();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not logged in!');
    return;
  }
  
  console.log('User:', user.email, user.id);
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();
    
  if (existing) {
    console.log('✓ User already exists in database');
    return;
  }
  
  // Create tenant
  const tenantName = user.email.split('@')[0] + "'s Law Firm";
  const tenantSlug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '-firm';
  
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: tenantName,
      slug: tenantSlug
    })
    .select()
    .single();
    
  if (tenantError) {
    console.error('Error creating tenant:', tenantError);
    return;
  }
  
  console.log('✓ Created tenant:', tenant.name);
  
  // Create user
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      tenant_id: tenant.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'owner'
    });
    
  if (userError) {
    console.error('Error creating user:', userError);
    return;
  }
  
  console.log('✓ Created user!');
  console.log('✅ Done! Refresh the page.');
})();
  `
  
  console.log(browserScript)
  console.log('\n---\n')

  for (const user of users) {
    console.log(`\nProcessing user: ${user.email} (${user.id})`)

    // Check if user exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      console.log('  ✓ User already exists in public.users')
      continue
    }

    console.log('  Creating tenant and user...')

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
      console.error('  ✗ Error creating tenant:', tenantError)
      continue
    }

    console.log(`  ✓ Created tenant: ${tenant.name} (${tenant.id})`)

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
      console.error('  ✗ Error creating user:', userError)
      continue
    }

    console.log(`  ✓ Created user record for ${user.email}`)
  }

  console.log('\n✅ Done!')
}

fixUser().catch(console.error)
