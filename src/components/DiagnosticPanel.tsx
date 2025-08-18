import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

type DiagnosticResult = {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: string
}

export function DiagnosticPanel() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    const newResults: DiagnosticResult[] = []

    // Check Supabase connection
    newResults.push({
      name: 'Supabase Connection',
      status: 'loading',
      message: 'Checking connection...'
    })
    setResults([...newResults])

    try {
      const { data, error } = await supabase.from('campaigns').select('count').limit(1)
      if (error) throw error
      
      newResults[0] = {
        name: 'Supabase Connection',
        status: 'success',
        message: 'Connected successfully'
      }
    } catch (error) {
      newResults[0] = {
        name: 'Supabase Connection',
        status: 'error',
        message: 'Connection failed',
        details: String(error)
      }
    }
    setResults([...newResults])

    // Check environment variables
    newResults.push({
      name: 'Environment Variables',
      status: 'loading',
      message: 'Checking configuration...'
    })
    setResults([...newResults])

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      newResults[1] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Missing environment variables',
        details: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required'
      }
    } else {
      newResults[1] = {
        name: 'Environment Variables',
        status: 'success',
        message: 'Environment variables configured'
      }
    }
    setResults([...newResults])

    // Test Edge Function
    newResults.push({
      name: 'Edge Functions',
      status: 'loading',
      message: 'Testing Edge Function...'
    })
    setResults([...newResults])

    try {
      const { data, error } = await supabase.functions.invoke('crawl-prospects', {
        body: { campaignId: 'test-diagnostic', maxResults: 1 }
      })
      
      if (error) {
        newResults[2] = {
          name: 'Edge Functions',
          status: 'error',
          message: 'Edge Function test failed',
          details: String(error)
        }
      } else {
        newResults[2] = {
          name: 'Edge Functions',
          status: 'success',
          message: 'Edge Functions are working'
        }
      }
    } catch (error) {
      newResults[2] = {
        name: 'Edge Functions',
        status: 'error',
        message: 'Edge Function test failed',
        details: String(error)
      }
    }
    setResults([...newResults])

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'loading':
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          System Diagnostics
        </CardTitle>
        <CardDescription>
          Check your system configuration and identify potential issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.some(r => r.status === 'error') && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some issues were detected. Please check the SETUP.md file for configuration instructions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
