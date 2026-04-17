'use client'

import { Gift, Calendar, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/app-context'
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CONDITION_LABELS,
  STATUS_LABELS,
  getItemTitle,
  getPriorityLabel,
  getPriorityColor,
  type Item
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface ItemCardProps {
  item: Item
  onClick: () => void
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const { t, lang, getBundleById } = useApp()
  
  const bundle = item.bundle_id ? getBundleById(item.bundle_id) : null
  const hasBundle = bundle?.enabled
  
  const discountPercent = item.original_price 
    ? Math.round(((item.original_price - item.asking_price) / item.original_price) * 100)
    : 0

  const isSold = item.status === 'sold'
  const isReserved = item.status === 'reserved'

  const viewDetailsLabel = { en: 'View Details', zh: '查看详情' }
  const bundleAvailableLabel = { en: 'Bundle available', zh: '可打包' }

  const availableFromDate = item.available_from ? new Date(item.available_from) : null
  const availableUntilDate = item.available_until ? new Date(item.available_until) : null
  const dateLocale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const availableLabel = (() => {
    if (!availableFromDate && !availableUntilDate) return null
    const fromStr = availableFromDate ? availableFromDate.toLocaleDateString(dateLocale, dateOpts) : (lang === 'zh' ? '即日起' : 'Now')
    const untilStr = availableUntilDate ? availableUntilDate.toLocaleDateString(dateLocale, dateOpts) : null
    return untilStr ? `${fromStr} – ${untilStr}` : fromStr
  })()

  // Only highlight priority if it's fairly urgent (<=4)
  const showPriority = item.sell_priority && item.sell_priority <= 4
  const priorityLabel = getPriorityLabel(item.sell_priority || 5)
  const priorityColor = getPriorityColor(item.sell_priority || 5)

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
            alt={getItemTitle(item, lang)}
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
          {t(STATUS_LABELS[item.status])}
        </Badge>
        
        {/* Condition badge */}
        <Badge
          variant="outline"
          className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm"
        >
          {t(CONDITION_LABELS[item.condition])}
        </Badge>

        {/* Featured badge */}
        {item.featured && (
          <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground">
            {lang === 'zh' ? '推荐' : 'Featured'}
          </Badge>
        )}

        {/* Urgent priority badge */}
        {showPriority && !isSold && (
          <Badge
            className={cn(
              'absolute bottom-2 right-2 border',
              priorityColor
            )}
          >
            <Flame className="h-3 w-3 mr-1" />
            {priorityLabel[lang]}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-medium text-foreground line-clamp-1 mb-1">
          {getItemTitle(item, lang)}
        </h3>
        
        {/* Category */}
        <p className="text-sm text-muted-foreground mb-2">
          {CATEGORY_ICONS[item.category]} {t(CATEGORY_LABELS[item.category])}
        </p>
        
        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            ¥{item.asking_price}
          </span>
          {item.original_price && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ¥{item.original_price}
              </span>
              {discountPercent > 0 && (
                <Badge variant="destructive" className="bg-primary text-primary-foreground text-xs">
                  -{discountPercent}%
                </Badge>
              )}
            </>
          )}
        </div>
        
        {/* Info chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hasBundle && (
            <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Gift className="h-3 w-3" />
              {t(bundleAvailableLabel)}
            </span>
          )}
          {availableLabel && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <Calendar className="h-3 w-3" />
              {availableLabel}
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
