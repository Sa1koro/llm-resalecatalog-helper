'use client'

import { Calendar, Eye, Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/app-context'
import { 
  CATEGORY_LABELS, 
  CATEGORY_ICONS, 
  CONDITION_LABELS, 
  STATUS_LABELS,
  type Item 
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface ItemCardProps {
  item: Item
  onClick: () => void
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const { t, data, getBundlesForItem } = useApp()
  
  const bundles = getBundlesForItem(item.id)
  const hasBundle = bundles.length > 0
  
  const discountPercent = Math.round(
    ((item.original_price - item.asking_price) / item.original_price) * 100
  )

  const isSold = item.status === 'sold'
  const isReserved = item.status === 'reserved'

  const viewDetailsLabel = { en: 'View Details', zh: '查看详情' }
  const availableLabel = { en: 'Available', zh: '可购买' }
  const bundleAvailableLabel = { en: 'Bundle available', zh: '可打包' }
  const viewableLabel = { en: 'Viewable', zh: '可预览' }

  // Format availability dates
  const formatDateRange = () => {
    if (!item.available_from && !item.available_until) return null
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (item.available_from && item.available_until) {
      return `${formatDate(item.available_from)} - ${formatDate(item.available_until)}`
    }
    if (item.available_from) {
      return `From ${formatDate(item.available_from)}`
    }
    if (item.available_until) {
      return `Until ${formatDate(item.available_until)}`
    }
    return null
  }

  const dateRange = formatDateRange()

  return (
    <Card 
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-warm-lg',
        isSold && 'sold-overlay'
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={t(item.title)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-50">
              {CATEGORY_ICONS[item.category]}
            </span>
          </div>
        )}
        
        {/* Status badge */}
        <Badge
          variant={isSold ? 'secondary' : isReserved ? 'outline' : 'default'}
          className={cn(
            'absolute top-2 right-2',
            !isSold && !isReserved && 'bg-secondary text-secondary-foreground'
          )}
        >
          {isSold ? '✓' : isReserved ? '🔖' : '🌿'} {t(STATUS_LABELS[item.status])}
        </Badge>
        
        {/* Condition badge */}
        <Badge
          variant="outline"
          className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm"
        >
          {t(CONDITION_LABELS[item.condition])}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-medium text-foreground line-clamp-1 mb-1">
          {t(item.title)}
        </h3>
        
        {/* Category */}
        <p className="text-sm text-muted-foreground mb-2">
          {CATEGORY_ICONS[item.category]} {t(CATEGORY_LABELS[item.category])}
        </p>
        
        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {data.meta.currency} ${item.asking_price}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            ${item.original_price}
          </span>
          {discountPercent > 0 && (
            <Badge variant="destructive" className="bg-primary text-primary-foreground text-xs">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        
        {/* Info chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dateRange && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <Calendar className="h-3 w-3" />
              {dateRange}
            </span>
          )}
          
          {item.allow_viewing && (
            <span className="inline-flex items-center gap-1 text-xs text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded-full">
              <Eye className="h-3 w-3" />
              {t(viewableLabel)}
            </span>
          )}
          
          {hasBundle && (
            <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Gift className="h-3 w-3" />
              {t(bundleAvailableLabel)}
            </span>
          )}
        </div>
        
        {/* View details button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {t(viewDetailsLabel)}
        </Button>
      </CardContent>
    </Card>
  )
}
