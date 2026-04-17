'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  const goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = 'shop'
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-card border rounded-2xl p-8 shadow-sm">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>

        <h1 className="text-2xl font-serif font-semibold text-center mb-2">
          出错了 / Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          页面在渲染过程中遇到了一个错误。你可以重试当前操作，或返回首页。
          <br />
          The page hit a runtime error. You can retry or go back home.
        </p>

        {error?.message && (
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40 mb-6 whitespace-pre-wrap break-all">
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ''}
          </pre>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={reset} className="flex-1 rounded-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            重试 / Try again
          </Button>
          <Button onClick={goHome} variant="outline" className="flex-1 rounded-full">
            <Home className="h-4 w-4 mr-2" />
            回首页 / Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
