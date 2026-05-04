'use client'

import { useState, useMemo, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { HeroSection } from './hero-section'
import { FilterBar } from './filter-bar'
import { ItemGrid } from './item-grid'
import { BundleSection } from './bundle-section'
import { ItemDetailModal } from './item-detail-modal'
import type { Category, Item } from '@/lib/types'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'available-soonest'

export function Storefront() {
  const { data, loading, selectedItemId, setSelectedItemId, getItemById } = useApp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [showSold, setShowSold] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Open detail modal when navigating to a shared link (e.g. /#shop/item/<uuid>)
  useEffect(() => {
    if (!loading && selectedItemId) {
      const item = getItemById(selectedItemId)
      if (item) {
        setSelectedItem(item)
      } else {
        // Item not found (invalid or stale UUID) — clean up the URL
        setSelectedItemId(null)
        window.history.replaceState(null, '', '#shop')
      }
    }
  }, [selectedItemId, loading, getItemById])

  const handleCloseModal = () => {
    setSelectedItem(null)
    // Clear the item deep-link from the URL hash without triggering a page reload
    if (selectedItemId) {
      setSelectedItemId(null)
      window.history.replaceState(null, '', '#shop')
    }
  }

  const filteredItems = useMemo(() => {
    let items = [...data.items]

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.title_zh.toLowerCase().includes(query) ||
        (item.title_en?.toLowerCase().includes(query)) ||
        (item.description_zh?.toLowerCase().includes(query)) ||
        (item.description_en?.toLowerCase().includes(query)) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory)
    }

    // Filter by status
    if (!showSold) {
      items = items.filter(item => item.status !== 'sold')
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        items.sort((a, b) => {
          // Featured items first
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          // Then by sort_order
          return a.sort_order - b.sort_order
        })
        break
      case 'price-asc':
        items.sort((a, b) => a.asking_price - b.asking_price)
        break
      case 'price-desc':
        items.sort((a, b) => b.asking_price - a.asking_price)
        break
      case 'newest':
        items.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
        break
      case 'available-soonest':
        items.sort((a, b) => {
          // Items with no `available_from` are treated as immediately available (timestamp 0)
          const aTime = a.available_from ? new Date(a.available_from).getTime() : 0
          const bTime = b.available_from ? new Date(b.available_from).getTime() : 0
          if (aTime !== bTime) return aTime - bTime
          // Tiebreaker: higher sell priority (lower number) first
          return (a.sell_priority || 5) - (b.sell_priority || 5)
        })
        break
    }

    return items
  }, [data.items, searchQuery, selectedCategory, showSold, sortBy])

  const enabledBundles = data.bundles.filter(b => b.enabled)

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 animate-pulse" />
        <div className="container px-4 py-8">
          <div className="h-12 bg-muted rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <HeroSection />
      
      <div className="container px-4 py-8">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showSold={showSold}
          onShowSoldChange={setShowSold}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <ItemGrid 
          items={filteredItems} 
          onItemClick={setSelectedItem}
        />

        {enabledBundles.length > 0 && (
          <BundleSection onItemClick={setSelectedItem} />
        )}
      </div>

      <ItemDetailModal 
        item={selectedItem} 
        onClose={handleCloseModal} 
      />
    </div>
  )
}
