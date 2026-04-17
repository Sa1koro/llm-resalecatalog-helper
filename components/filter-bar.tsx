'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/lib/app-context'
import { CATEGORY_LABELS, CATEGORY_ICONS, type Category } from '@/lib/types'
import { cn } from '@/lib/utils'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'available-soonest'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: Category | 'all'
  onCategoryChange: (value: Category | 'all') => void
  showSold: boolean
  onShowSoldChange: (value: boolean) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

const CATEGORIES: (Category | 'all')[] = [
  'all',
  'furniture',
  'electronics',
  'kitchen',
  'sports',
  'clothing',
  'books',
  'other'
]

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showSold,
  onShowSoldChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const { t } = useApp()

  const sortOptions: { value: SortOption; label: { en: string; zh: string } }[] = [
    { value: 'featured', label: { en: 'Featured', zh: '推荐排序' } },
    { value: 'available-soonest', label: { en: 'Available Soonest', zh: '最早可取' } },
    { value: 'price-asc', label: { en: 'Price: Low to High', zh: '价格从低到高' } },
    { value: 'price-desc', label: { en: 'Price: High to Low', zh: '价格从高到低' } },
    { value: 'newest', label: { en: 'Newest', zh: '最新发布' } },
  ]

  const allLabel = { en: 'All', zh: '全部' }
  const searchPlaceholder = { en: 'Search items...', zh: '搜索物品...' }
  const showSoldLabel = { en: 'Show sold', zh: '显示已售' }
  const sortLabel = { en: 'Sort by', zh: '排序' }

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t(searchPlaceholder)}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-sold"
              checked={showSold}
              onCheckedChange={onShowSoldChange}
            />
            <Label htmlFor="show-sold" className="text-sm whitespace-nowrap">
              {t(showSoldLabel)}
            </Label>
          </div>
          
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[160px] rounded-full">
              <SelectValue placeholder={t(sortLabel)} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category
          const label = category === 'all' ? allLabel : CATEGORY_LABELS[category]
          const icon = category === 'all' ? '✨' : CATEGORY_ICONS[category]
          
          return (
            <Button
              key={category}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={cn(
                'rounded-full whitespace-nowrap flex-shrink-0',
                isSelected && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="mr-1.5">{icon}</span>
              {t(label)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
