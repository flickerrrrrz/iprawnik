import { createClient } from '@/lib/supabase/server'

export default async function TestConnectionPage() {
  const supabase = await createClient()
  
  let connectionStatus = {
    success: false,
    message: '',
    details: {} as any
  }
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase.from('_schema_version').select('version').limit(1)
    
    if (error) {
      // Try a simple query that should work even without tables
      const { data: healthData, error: healthError } = await supabase.auth.getSession()
      
      if (healthError) {
        connectionStatus = {
          success: false,
          message: 'Connection failed',
          details: { error: healthError.message }
        }
      } else {
        connectionStatus = {
          success: true,
          message: 'Connection successful!',
          details: {
            session: healthData.session ? 'Active session' : 'No active session',
            note: 'Supabase client is working'
          }
        }
      }
    } else {
      connectionStatus = {
        success: true,
        message: 'Connection successful!',
        details: { schema_version: data }
      }
    }
  } catch (err: any) {
    connectionStatus = {
      success: false,
      message: 'Connection test failed',
      details: { error: err.message }
    }
  }
  
  // Test configuration
  const config = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.SUPABASE_SECRET_KEY,
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Supabase Connection Test</h1>
          <p className="text-muted-foreground">Testing connection to Prawnik AI database</p>
        </div>

        {/* Connection Status */}
        <div className={`p-6 rounded-lg border-2 ${
          connectionStatus.success 
            ? 'bg-green-50 dark:bg-green-950 border-green-500' 
            : 'bg-red-50 dark:bg-red-950 border-red-500'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              connectionStatus.success ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <h2 className="text-2xl font-semibold">
              {connectionStatus.success ? '✅ Connected' : '❌ Connection Failed'}
            </h2>
          </div>
          <p className="text-lg mb-4">{connectionStatus.message}</p>
          <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(connectionStatus.details, null, 2)}
          </pre>
        </div>

        {/* Configuration */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Configuration</h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supabase URL:</span>
              <span className="font-semibold">{config.url || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Publishable Key:</span>
              <span className={config.hasPublishableKey ? 'text-green-600' : 'text-red-600'}>
                {config.hasPublishableKey ? '✓ Present' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Secret Key:</span>
              <span className={config.hasSecretKey ? 'text-green-600' : 'text-red-600'}>
                {config.hasSecretKey ? '✓ Present' : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-500">
          <h3 className="text-xl font-semibold mb-3">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Verify environment variables are loaded correctly</li>
            <li>Check Supabase dashboard for project status</li>
            <li>Enable required extensions (pgvector, uuid-ossp)</li>
            <li>Run database migrations</li>
            <li>Configure RLS policies</li>
          </ol>
        </div>

        <div className="text-center">
          <a 
            href="/" 
            className="text-primary hover:underline text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
