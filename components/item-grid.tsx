'use client'

import { Package } from 'lucide-react'
import { ItemCard } from './item-card'
import { useApp } from '@/lib/app-context'
import type { Item } from '@/lib/types'

interface ItemGridProps {
  items: Item[]
  onItemClick: (item: Item) => void
}

export function ItemGrid({ items, onItemClick }: ItemGridProps) {
  const { t } = useApp()

  const emptyTitle = { en: 'No items found', zh: '未找到物品' }
  const emptyDescription = { 
    en: 'Try adjusting your search or filters', 
    zh: '尝试调整搜索条件或筛选器' 
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          {t(emptyTitle)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(emptyDescription)}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((item) => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  )
}
