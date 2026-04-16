'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/lib/app-context'
import { HeroSection } from './hero-section'
import { FilterBar } from './filter-bar'
import { ItemGrid } from './item-grid'
import { BundleSection } from './bundle-section'
import { ItemDetailModal } from './item-detail-modal'
import type { Category, ItemStatus, Item } from '@/lib/types'

type SortOption = 'priority' | 'price-asc' | 'price-desc' | 'newest'

export function Storefront() {
  const { data, t } = useApp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [showSold, setShowSold] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('priority')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  const filteredItems = useMemo(() => {
    let items = [...data.items]

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.title.en.toLowerCase().includes(query) ||
        item.title.zh.toLowerCase().includes(query) ||
        item.description.en.toLowerCase().includes(query) ||
        item.description.zh.toLowerCase().includes(query) ||
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
      case 'priority':
        items.sort((a, b) => a.sell_priority - b.sell_priority)
        break
      case 'price-asc':
        items.sort((a, b) => a.asking_price - b.asking_price)
        break
      case 'price-desc':
        items.sort((a, b) => b.asking_price - a.asking_price)
        break
      case 'newest':
        // Assuming items are added in order, reverse to show newest first
        items.reverse()
        break
    }

    return items
  }, [data.items, searchQuery, selectedCategory, showSold, sortBy])

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

        {data.bundles.length > 0 && (
          <BundleSection onItemClick={setSelectedItem} />
        )}
      </div>

      <ItemDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  )
}
