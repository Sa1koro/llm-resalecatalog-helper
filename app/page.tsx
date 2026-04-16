'use client'

import { AppProvider, useApp } from '@/lib/app-context'
import { Navbar } from '@/components/navbar'
import { Storefront } from '@/components/storefront'
import { AdminPanel } from '@/components/admin-panel'
import { PromptTool } from '@/components/prompt-tool'
import { ImportTool } from '@/components/import-tool'

function AppContent() {
  const { route, isAuthenticated } = useApp()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {route === 'shop' && <Storefront />}
        {route === 'admin' && <AdminPanel />}
        {route === 'prompt-tool' && isAuthenticated && <PromptTool />}
        {route === 'import' && isAuthenticated && <ImportTool />}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
