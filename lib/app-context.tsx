'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AppData, Item, Bundle, Language, ItemStatus } from './types'
import { sampleData } from './sample-data'

type Route = 'shop' | 'admin' | 'prompt-tool' | 'import'

interface AppContextValue {
  // Data
  data: AppData
  setData: (data: AppData) => void
  
  // Items CRUD
  addItem: (item: Item) => void
  updateItem: (id: string, item: Partial<Item>) => void
  deleteItem: (id: string) => void
  duplicateItem: (id: string) => Item
  updateItemStatus: (id: string, status: ItemStatus) => void
  reorderItems: (fromIndex: number, toIndex: number) => void
  
  // Bundles CRUD
  addBundle: (bundle: Bundle) => void
  updateBundle: (id: string, bundle: Partial<Bundle>) => void
  deleteBundle: (id: string) => void
  
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
  
  // Auth
  isAuthenticated: boolean
  authenticate: (password: string) => boolean
  logout: () => void
  
  // Helpers
  getItemById: (id: string) => Item | undefined
  getBundleById: (id: string) => Bundle | undefined
  getItemsInBundle: (bundleId: string) => Item[]
  getBundlesForItem: (itemId: string) => Bundle[]
  calculateBundleSavings: (bundle: Bundle) => number
  calculateTotalIndividualPrice: (bundle: Bundle) => number
}

const AppContext = createContext<AppContextValue | null>(null)

const ADMIN_PASSWORD = 'resale2026'

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(sampleData)
  const [lang, setLang] = useState<Language>('zh')
  const [isDark, setIsDark] = useState(false)
  const [route, setRouteState] = useState<Route>('shop')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Route
      if (['shop', 'admin', 'prompt-tool', 'import'].includes(hash)) {
        setRouteState(hash)
      } else {
        setRouteState('shop')
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
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setRoute('shop')
  }, [setRoute])

  // Item CRUD
  const addItem = useCallback((item: Item) => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  }, [])

  const deleteItem = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      bundles: prev.bundles.map(bundle => ({
        ...bundle,
        item_ids: bundle.item_ids.filter(itemId => itemId !== id)
      })).filter(bundle => bundle.item_ids.length > 0)
    }))
  }, [])

  const duplicateItem = useCallback((id: string): Item => {
    const original = data.items.find(item => item.id === id)
    if (!original) throw new Error('Item not found')
    
    const newItem: Item = {
      ...original,
      id: `item-${Date.now()}`,
      title: {
        en: `${original.title.en} (Copy)`,
        zh: `${original.title.zh} (副本)`
      },
      status: 'available'
    }
    
    addItem(newItem)
    return newItem
  }, [data.items, addItem])

  const updateItemStatus = useCallback((id: string, status: ItemStatus) => {
    updateItem(id, { status })
  }, [updateItem])

  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    setData(prev => {
      const newItems = [...prev.items]
      const [removed] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, removed)
      return { ...prev, items: newItems }
    })
  }, [])

  // Bundle CRUD
  const addBundle = useCallback((bundle: Bundle) => {
    setData(prev => ({
      ...prev,
      bundles: [...prev.bundles, bundle]
    }))
  }, [])

  const updateBundle = useCallback((id: string, updates: Partial<Bundle>) => {
    setData(prev => ({
      ...prev,
      bundles: prev.bundles.map(bundle =>
        bundle.id === id ? { ...bundle, ...updates } : bundle
      )
    }))
  }, [])

  const deleteBundle = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bundles: prev.bundles.filter(bundle => bundle.id !== id)
    }))
  }, [])

  // Helpers
  const getItemById = useCallback((id: string) => {
    return data.items.find(item => item.id === id)
  }, [data.items])

  const getBundleById = useCallback((id: string) => {
    return data.bundles.find(bundle => bundle.id === id)
  }, [data.bundles])

  const getItemsInBundle = useCallback((bundleId: string) => {
    const bundle = data.bundles.find(b => b.id === bundleId)
    if (!bundle) return []
    return bundle.item_ids.map(id => data.items.find(item => item.id === id)).filter(Boolean) as Item[]
  }, [data.bundles, data.items])

  const getBundlesForItem = useCallback((itemId: string) => {
    return data.bundles.filter(bundle => bundle.item_ids.includes(itemId))
  }, [data.bundles])

  const calculateTotalIndividualPrice = useCallback((bundle: Bundle) => {
    return bundle.item_ids.reduce((total, id) => {
      const item = data.items.find(i => i.id === id)
      return total + (item?.asking_price || 0)
    }, 0)
  }, [data.items])

  const calculateBundleSavings = useCallback((bundle: Bundle) => {
    const individualTotal = calculateTotalIndividualPrice(bundle)
    return individualTotal - bundle.bundle_price
  }, [calculateTotalIndividualPrice])

  const value: AppContextValue = {
    data,
    setData,
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
    isAuthenticated,
    authenticate,
    logout,
    getItemById,
    getBundleById,
    getItemsInBundle,
    getBundlesForItem,
    calculateBundleSavings,
    calculateTotalIndividualPrice,
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
