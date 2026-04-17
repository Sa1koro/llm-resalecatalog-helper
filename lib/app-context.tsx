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
  authenticate: (password: string) => boolean
  logout: () => void
  
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

      // If no settings exist, create default
      let settings = settingsRes.data
      if (!settings) {
        const { data: newSettings } = await supabase
          .from('settings')
          .insert([{ seller_name: 'ResaleBox', admin_password: 'resale2026' }])
          .select()
          .single()
        settings = newSettings
      }

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
  const authenticate = useCallback((password: string) => {
    if (password === data.settings.admin_password) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [data.settings.admin_password])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setRoute('shop')
  }, [setRoute])

  // Settings
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const { error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', data.settings.id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        settings: { ...prev.settings, ...updates }
      }))
    }
  }, [supabase, data.settings.id])

  // Contact Methods
  const addContactMethod = useCallback(async (method: Omit<ContactMethod, 'id'>) => {
    const { data: newMethod, error } = await supabase
      .from('contact_methods')
      .insert([method])
      .select()
      .single()
    
    if (!error && newMethod) {
      setData(prev => ({
        ...prev,
        contactMethods: [...prev.contactMethods, newMethod]
      }))
    }
  }, [supabase])

  const updateContactMethod = useCallback(async (id: string, updates: Partial<ContactMethod>) => {
    const { error } = await supabase
      .from('contact_methods')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        contactMethods: prev.contactMethods.map(m => m.id === id ? { ...m, ...updates } : m)
      }))
    }
  }, [supabase])

  const deleteContactMethod = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('contact_methods')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        contactMethods: prev.contactMethods.filter(m => m.id !== id)
      }))
    }
  }, [supabase])

  // Item CRUD
  const addItem = useCallback(async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> => {
    const { data: newItem, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single()
    
    if (error) throw error
    
    setData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
    
    return newItem
  }, [supabase])

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const { error } = await supabase
      .from('items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      }))
    }
  }, [supabase])

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }))
    }
  }, [supabase])

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
        supabase
          .from('items')
          .update({ sort_order: index, updated_at: now })
          .eq('id', id)
      )
    )
  }, [supabase])

  // Bundle CRUD
  const addBundle = useCallback(async (bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>): Promise<Bundle> => {
    const { data: newBundle, error } = await supabase
      .from('bundles')
      .insert([bundle])
      .select()
      .single()
    
    if (error) throw error
    
    setData(prev => ({
      ...prev,
      bundles: [...prev.bundles, newBundle]
    }))
    
    return newBundle
  }, [supabase])

  const updateBundle = useCallback(async (id: string, updates: Partial<Bundle>) => {
    const { error } = await supabase
      .from('bundles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        bundles: prev.bundles.map(bundle =>
          bundle.id === id ? { ...bundle, ...updates } : bundle
        )
      }))
    }
  }, [supabase])

  const deleteBundle = useCallback(async (id: string) => {
    // First, unlink all items from this bundle
    await supabase
      .from('items')
      .update({ bundle_id: null })
      .eq('bundle_id', id)
    
    const { error } = await supabase
      .from('bundles')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setData(prev => ({
        ...prev,
        bundles: prev.bundles.filter(bundle => bundle.id !== id),
        items: prev.items.map(item => 
          item.bundle_id === id ? { ...item, bundle_id: null } : item
        )
      }))
    }
  }, [supabase])

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
