'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AppData, Item, Bundle, Language, ItemStatus, Settings, ContactMethod } from './types'
import { createClient } from './supabase/client'

type Route = 'shop' | 'admin' | 'prompt-tool' | 'import'

const DEFAULT_SETTINGS: Settings = {
  id: '',
  seller_name: 'ResaleBox',
  location: null,
  moving_date: null,
  admin_password: 'resale2026',
  currency: 'CAD',
}

const DEFAULT_DATA: AppData = {
  settings: DEFAULT_SETTINGS,
  contactMethods: [],
  items: [],
  bundles: [],
}

interface AppContextValue {
  // Loading state
  loading: boolean
  error: string | null
  
  // Data
  data: AppData
  refreshData: () => Promise<void>
  
  // Settings
  updateSettings: (settings: Partial<Settings>) => Promise<void>
  
  // Contact Methods
  addContactMethod: (method: Omit<ContactMethod, 'id'>) => Promise<void>
  updateContactMethod: (id: string, method: Partial<ContactMethod>) => Promise<void>
  deleteContactMethod: (id: string) => Promise<void>
  
  // Items CRUD
  addItem: (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<Item>
  updateItem: (id: string, item: Partial<Item>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  duplicateItem: (id: string) => Promise<Item>
  updateItemStatus: (id: string, status: ItemStatus) => Promise<void>
  reorderItems: (orderedIds: string[]) => Promise<void>
  
  // Bundles CRUD
  addBundle: (bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>) => Promise<Bundle>
  updateBundle: (id: string, bundle: Partial<Bundle>) => Promise<void>
  deleteBundle: (id: string) => Promise<void>
  
  // Language
  lang: Language
  setLang: (lang: Language) => void
  t: (text: { en: string; zh: string }) => string
  
  // Theme
  isDark: boolean
  toggleDark: () => void
  
  // Routing
  route: Route
  setRoute: (route: Route) => void
  selectedItemId: string | null
  setSelectedItemId: (id: string | null) => void
  
  // Auth
  isAuthenticated: boolean
  authenticate: (password: string) => Promise<boolean>
  logout: () => Promise<void>
  
  // Helpers
  getItemById: (id: string) => Item | undefined
  getBundleById: (id: string) => Bundle | undefined
  getItemsInBundle: (bundleId: string) => Item[]
  calculateBundlePrice: (bundle: Bundle) => number
  calculateBundleSavings: (bundle: Bundle) => number
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<Language>('zh')
  const [isDark, setIsDark] = useState(false)
  const [route, setRouteState] = useState<Route>('shop')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const supabase = createClient()

  const adminRequest = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    })

    let payload: any = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (response.status === 401) {
      setIsAuthenticated(false)
    }

    if (!response.ok) {
      throw new Error(payload?.error || 'Request failed')
    }

    return (payload?.data ?? payload) as T
  }, [])

  // Fetch all data from Supabase
  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [settingsRes, contactsRes, itemsRes, bundlesRes] = await Promise.all([
        supabase.from('settings').select('*').limit(1).single(),
        supabase.from('contact_methods').select('*').order('sort_order'),
        supabase.from('items').select('*').order('sort_order'),
        supabase.from('bundles').select('*').order('sort_order'),
      ])

      const settings = settingsRes.data

      setData({
        settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS,
        contactMethods: contactsRes.data || [],
        items: itemsRes.data || [],
        bundles: bundlesRes.data || [],
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Initial data fetch
  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    let mounted = true
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store' })
        if (!response.ok) return
        const payload = await response.json()
        if (mounted) {
          setIsAuthenticated(Boolean(payload?.authenticated))
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false)
        }
      }
    }

    checkSession()
    return () => {
      mounted = false
    }
  }, [])

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      const [routePart, itemPart] = hash.split('/item/')
      
      if (['shop', 'admin', 'prompt-tool', 'import'].includes(routePart)) {
        setRouteState(routePart as Route)
      } else {
        setRouteState('shop')
      }
      
      if (itemPart) {
        setSelectedItemId(itemPart)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Detect system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const setRoute = useCallback((newRoute: Route) => {
    window.location.hash = newRoute
    setRouteState(newRoute)
  }, [])

  const toggleDark = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  const t = useCallback((text: { en: string; zh: string }) => {
    return text[lang]
  }, [lang])

  // Auth
  const authenticate = useCallback(async (password: string) => {
    try {
      await adminRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      setIsAuthenticated(true)
      return true
    } catch {
      setIsAuthenticated(false)
      return false
    }
  }, [adminRequest])

  const logout = useCallback(async () => {
    try {
      await adminRequest('/api/admin/logout', { method: 'POST' })
    } catch {
      // Even if logout API fails, clear local auth state.
    }
    setIsAuthenticated(false)
    setRoute('shop')
  }, [adminRequest, setRoute])

  // Settings
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const updatedSettings = await adminRequest<Settings>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ id: data.settings.id, ...updates }),
    })

    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updatedSettings },
    }))
  }, [adminRequest, data.settings.id])

  // Contact Methods
  const addContactMethod = useCallback(async (method: Omit<ContactMethod, 'id'>) => {
    const newMethod = await adminRequest<ContactMethod>('/api/admin/contact-methods', {
      method: 'POST',
      body: JSON.stringify(method),
    })

    setData(prev => ({
      ...prev,
      contactMethods: [...prev.contactMethods, newMethod],
    }))
  }, [adminRequest])

  const updateContactMethod = useCallback(async (id: string, updates: Partial<ContactMethod>) => {
    const updatedMethod = await adminRequest<ContactMethod>(`/api/admin/contact-methods/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })

    setData(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.map(m => (m.id === id ? { ...m, ...updatedMethod } : m)),
    }))
  }, [adminRequest])

  const deleteContactMethod = useCallback(async (id: string) => {
    await adminRequest(`/api/admin/contact-methods/${id}`, {
      method: 'DELETE',
    })

    setData(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.filter(m => m.id !== id),
    }))
  }, [adminRequest])

  // Item CRUD
  const addItem = useCallback(async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> => {
    const newItem = await adminRequest<Item>('/api/admin/items', {
      method: 'POST',
      body: JSON.stringify(item),
    })

    setData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }))

    return newItem
  }, [adminRequest])

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const updatedItem = await adminRequest<Item>(`/api/admin/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
    })

    setData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    }))
  }, [adminRequest])

  const deleteItem = useCallback(async (id: string) => {
    await adminRequest(`/api/admin/items/${id}`, {
      method: 'DELETE',
    })

    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }))
  }, [adminRequest])

  const duplicateItem = useCallback(async (id: string): Promise<Item> => {
    const original = data.items.find(item => item.id === id)
    if (!original) throw new Error('Item not found')
    
    const { id: _, created_at, updated_at, ...itemData } = original
    const newItem = {
      ...itemData,
      title_zh: `${original.title_zh} (副本)`,
      title_en: original.title_en ? `${original.title_en} (Copy)` : null,
      status: 'available' as ItemStatus,
    }
    
    return addItem(newItem)
  }, [data.items, addItem])

  const updateItemStatus = useCallback(async (id: string, status: ItemStatus) => {
    await updateItem(id, { status })
  }, [updateItem])

  // Reorder items: orderedIds must contain every item id exactly once
  const reorderItems = useCallback(async (orderedIds: string[]) => {
    // Optimistically reorder local state first
    setData(prev => {
      const byId = new Map(prev.items.map(item => [item.id, item]))
      const newItems = orderedIds
        .map((id, index) => {
          const item = byId.get(id)
          if (!item) return null
          return { ...item, sort_order: index }
        })
        .filter((x): x is Item => x !== null)
      return { ...prev, items: newItems }
    })

    // Persist each row's new sort_order. Parallel to minimize latency.
    const now = new Date().toISOString()
    await Promise.all(
      orderedIds.map((id, index) =>
        adminRequest(`/api/admin/items/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sort_order: index, updated_at: now }),
        })
      )
    )
  }, [adminRequest])

  // Bundle CRUD
  const addBundle = useCallback(async (bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>): Promise<Bundle> => {
    const newBundle = await adminRequest<Bundle>('/api/admin/bundles', {
      method: 'POST',
      body: JSON.stringify(bundle),
    })

    setData(prev => ({
      ...prev,
      bundles: [...prev.bundles, newBundle],
    }))

    return newBundle
  }, [adminRequest])

  const updateBundle = useCallback(async (id: string, updates: Partial<Bundle>) => {
    const updatedBundle = await adminRequest<Bundle>(`/api/admin/bundles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
    })

    setData(prev => ({
      ...prev,
      bundles: prev.bundles.map(bundle =>
        bundle.id === id ? { ...bundle, ...updatedBundle } : bundle
      ),
    }))
  }, [adminRequest])

  const deleteBundle = useCallback(async (id: string) => {
    await adminRequest(`/api/admin/bundles/${id}`, {
      method: 'DELETE',
    })

    setData(prev => ({
      ...prev,
      bundles: prev.bundles.filter(bundle => bundle.id !== id),
      items: prev.items.map(item =>
        item.bundle_id === id ? { ...item, bundle_id: null } : item
      ),
    }))
  }, [adminRequest])

  // Helpers
  const getItemById = useCallback((id: string) => {
    return data.items.find(item => item.id === id)
  }, [data.items])

  const getBundleById = useCallback((id: string) => {
    return data.bundles.find(bundle => bundle.id === id)
  }, [data.bundles])

  const getItemsInBundle = useCallback((bundleId: string) => {
    return data.items.filter(item => item.bundle_id === bundleId)
  }, [data.items])

  const calculateBundlePrice = useCallback((bundle: Bundle) => {
    const items = data.items.filter(item => item.bundle_id === bundle.id)
    const totalPrice = items.reduce((sum, item) => sum + item.asking_price, 0)
    return totalPrice * (1 - bundle.discount_percent / 100)
  }, [data.items])

  const calculateBundleSavings = useCallback((bundle: Bundle) => {
    const items = data.items.filter(item => item.bundle_id === bundle.id)
    const totalPrice = items.reduce((sum, item) => sum + item.asking_price, 0)
    return totalPrice * bundle.discount_percent / 100
  }, [data.items])

  const value: AppContextValue = {
    loading,
    error,
    data,
    refreshData,
    updateSettings,
    addContactMethod,
    updateContactMethod,
    deleteContactMethod,
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    updateItemStatus,
    reorderItems,
    addBundle,
    updateBundle,
    deleteBundle,
    lang,
    setLang,
    t,
    isDark,
    toggleDark,
    route,
    setRoute,
    selectedItemId,
    setSelectedItemId,
    isAuthenticated,
    authenticate,
    logout,
    getItemById,
    getBundleById,
    getItemsInBundle,
    calculateBundlePrice,
    calculateBundleSavings,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Alias for backward compatibility
export const useAppContext = useApp
