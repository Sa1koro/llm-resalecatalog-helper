'use client'

import { useState } from 'react'
import { Lock, Package, CheckCircle, Clock, DollarSign, FileDown, FileUp, Wand2, LayoutGrid, List, Settings, Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/app-context'
import { AdminItemList } from './admin-item-list'
import { ItemFormModal } from './item-form-modal'
import { PostGeneratorModal } from './post-generator-modal'
import { SettingsPanel } from './settings-panel'
import { BundleManager } from './bundle-manager'
import { formatPrice, type Item } from '@/lib/types'

export function AdminPanel() {
  const { isAuthenticated, authenticate, setRoute, data, t, lang, loading } = useApp()
  const currency = data.settings.currency || 'CAD'
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [postGeneratorItem, setPostGeneratorItem] = useState<Item | null>(null)
  const [activeTab, setActiveTab] = useState('items')

  const labels = {
    title: { en: 'Admin Panel', zh: '管理后台' },
    passwordPlaceholder: { en: 'Enter admin password', zh: '输入管理员密码' },
    login: { en: 'Login', zh: '登录' },
    wrongPassword: { en: 'Wrong password', zh: '密码错误' },
    totalItems: { en: 'Total Items', zh: '物品总数' },
    available: { en: 'Available', zh: '可售' },
    reserved: { en: 'Reserved', zh: '已预订' },
    sold: { en: 'Sold', zh: '已售' },
    totalValue: { en: 'Total Value', zh: '总价值' },
    addItem: { en: 'Add Item', zh: '添加物品' },
    promptTool: { en: 'Prompt Generator', zh: '提示词生成器' },
    import: { en: 'Import', zh: '导入' },
    export: { en: 'Export JSON', zh: '导出 JSON' },
    items: { en: 'Items', zh: '物品管理' },
    bundles: { en: 'Bundles', zh: '套装管理' },
    settings: { en: 'Settings', zh: '设置' },
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (authenticate(password)) {
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleExport = () => {
    const exportData = {
      settings: data.settings,
      contactMethods: data.contactMethods,
      items: data.items,
      bundles: data.bundles,
    }
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resalebox-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate stats
  const stats = {
    total: data.items.length,
    available: data.items.filter(i => i.status === 'available').length,
    reserved: data.items.filter(i => i.status === 'reserved').length,
    sold: data.items.filter(i => i.status === 'sold').length,
    totalValue: data.items.filter(i => i.status !== 'sold').reduce((sum, i) => sum + i.asking_price, 0),
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t(labels.title)}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder={t(labels.passwordPlaceholder)}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                className={error ? 'border-destructive' : ''}
              />
              {error && (
                <p className="text-sm text-destructive">{t(labels.wrongPassword)}</p>
              )}
              <Button type="submit" className="w-full rounded-full">
                {t(labels.login)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-12 bg-muted rounded-lg w-64" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{t(labels.totalItems)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.available}</p>
              <p className="text-xs text-muted-foreground">{t(labels.available)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.reserved}</p>
              <p className="text-xs text-muted-foreground">{t(labels.reserved)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sold}</p>
              <p className="text-xs text-muted-foreground">{t(labels.sold)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(stats.totalValue, currency)}</p>
              <p className="text-xs text-muted-foreground">{t(labels.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="items" className="gap-1.5">
              <Package className="h-4 w-4" />
              {t(labels.items)}
            </TabsTrigger>
            <TabsTrigger value="bundles" className="gap-1.5">
              <Boxes className="h-4 w-4" />
              {t(labels.bundles)}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" />
              {t(labels.settings)}
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'items' && (
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsFormOpen(true)} className="rounded-full">
                {t(labels.addItem)}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRoute('prompt-tool')}
                className="rounded-full"
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                {t(labels.promptTool)}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="rounded-full"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRoute('import')}
                className="rounded-full"
              >
                <FileUp className="h-4 w-4 mr-1.5" />
                {t(labels.import)}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="rounded-full"
              >
                <FileDown className="h-4 w-4 mr-1.5" />
                {t(labels.export)}
              </Button>
            </div>
          )}
        </div>
        
        <TabsContent value="items" className="mt-0">
          <AdminItemList 
            viewMode={viewMode}
            onEdit={setEditingItem}
            onGeneratePost={setPostGeneratorItem}
          />
        </TabsContent>
        
        <TabsContent value="bundles" className="mt-0">
          <BundleManager />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
      
      {/* Edit/Add form modal */}
      <ItemFormModal
        item={editingItem}
        isOpen={isFormOpen || !!editingItem}
        onClose={() => {
          setIsFormOpen(false)
          setEditingItem(null)
        }}
      />
      
      {/* Post generator modal */}
      <PostGeneratorModal
        item={postGeneratorItem}
        onClose={() => setPostGeneratorItem(null)}
      />
    </div>
  )
}
