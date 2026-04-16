'use client'

import { useState } from 'react'
import { 
  X, 
  ExternalLink, 
  Copy, 
  Share2, 
  Calendar, 
  Eye,
  Gift,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/lib/app-context'
import { toast } from 'sonner'
import { 
  CATEGORY_LABELS, 
  CATEGORY_ICONS, 
  CONDITION_LABELS, 
  STATUS_LABELS,
  type Item 
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface ItemDetailModalProps {
  item: Item | null
  onClose: () => void
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const { data, t, lang, getBundlesForItem, getItemsInBundle, calculateBundleSavings, calculateTotalIndividualPrice } = useApp()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  if (!item) return null

  const bundles = getBundlesForItem(item.id)
  const discountPercent = Math.round(
    ((item.original_price - item.asking_price) / item.original_price) * 100
  )
  const isSold = item.status === 'sold'
  const isReserved = item.status === 'reserved'

  const labels = {
    originalPrice: { en: 'Original price', zh: '原价' },
    askingPrice: { en: 'Asking price', zh: '售价' },
    condition: { en: 'Condition', zh: '成色' },
    category: { en: 'Category', zh: '分类' },
    availability: { en: 'Availability', zh: '可用时间' },
    viewable: { en: 'Can view before purchase', zh: '可在购买前查看' },
    originalListing: { en: 'Original listing', zh: '原商品链接' },
    reviews: { en: 'Reviews', zh: '评价' },
    copyContact: { en: 'Copy contact info', zh: '复制联系方式' },
    share: { en: 'Share', zh: '分享' },
    bundleDeals: { en: 'Bundle Deals', zh: '打包优惠' },
    save: { en: 'Save', zh: '省' },
    tags: { en: 'Tags', zh: '标签' },
    notes: { en: 'Notes', zh: '备注' },
    copied: { en: 'Copied!', zh: '已复制！' },
  }

  const formatDateRange = () => {
    if (!item.available_from && !item.available_until) return null
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
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

  const handleCopyContact = () => {
    navigator.clipboard.writeText(data.meta.contact)
    setCopied(true)
    toast.success(t(labels.copied))
    setTimeout(() => setCopied(false), 2000)
  }

  const nextImage = () => {
    if (item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
    }
  }

  const prevImage = () => {
    if (item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image gallery */}
        <div className="relative aspect-[4/3] bg-muted">
          {item.images.length > 0 ? (
            <>
              <img
                src={item.images[currentImageIndex]}
                alt={t(item.title)}
                className="w-full h-full object-contain"
              />
              {item.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          idx === currentImageIndex ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-50">
                {CATEGORY_ICONS[item.category]}
              </span>
            </div>
          )}
          
          {/* Status badge */}
          <Badge
            variant={isSold ? 'secondary' : isReserved ? 'outline' : 'default'}
            className={cn(
              'absolute top-4 right-4 text-sm',
              !isSold && !isReserved && 'bg-secondary text-secondary-foreground'
            )}
          >
            {isSold ? '✓' : isReserved ? '🔖' : '🌿'} {t(STATUS_LABELS[item.status])}
          </Badge>
        </div>
        
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-serif">
              {t(item.title)}
            </DialogTitle>
          </DialogHeader>
          
          {/* Price block */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">
              {data.meta.currency} ${item.asking_price}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              ${item.original_price}
            </span>
            {discountPercent > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {t(item.description)}
          </p>
          
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t(labels.condition)}
              </p>
              <Badge variant="outline">
                {t(CONDITION_LABELS[item.condition])}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t(labels.category)}
              </p>
              <span className="text-sm">
                {CATEGORY_ICONS[item.category]} {t(CATEGORY_LABELS[item.category])}
              </span>
            </div>
          </div>
          
          {/* Availability and viewing */}
          {(dateRange || item.allow_viewing) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {dateRange && (
                <Badge variant="outline" className="gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {dateRange}
                </Badge>
              )}
              {item.allow_viewing && (
                <Badge variant="outline" className="gap-1.5 bg-secondary/10">
                  <Eye className="h-3 w-3" />
                  {t(labels.viewable)}
                </Badge>
              )}
            </div>
          )}
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase mb-2">
                {t(labels.tags)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {item.notes && (item.notes.en || item.notes.zh) && (
            <div className="mb-6 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t(labels.notes)}
              </p>
              <p className="text-sm">{t(item.notes)}</p>
            </div>
          )}
          
          {/* Links */}
          <div className="flex flex-wrap gap-2 mb-6">
            {item.purchase_link && (
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <a href={item.purchase_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  {t(labels.originalListing)}
                </a>
              </Button>
            )}
            {item.review_links && item.review_links.length > 0 && (
              item.review_links.map((link, idx) => (
                <Button key={idx} variant="outline" size="sm" className="rounded-full" asChild>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    {t(labels.reviews)} {idx + 1}
                  </a>
                </Button>
              ))
            )}
          </div>
          
          {/* Bundle section */}
          {bundles.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                {t(labels.bundleDeals)}
              </p>
              {bundles.map((bundle) => {
                const bundleItems = getItemsInBundle(bundle.id)
                const savings = calculateBundleSavings(bundle)
                const individualTotal = calculateTotalIndividualPrice(bundle)
                
                return (
                  <Card key={bundle.id} className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{t(bundle.title)}</h4>
                        <Badge className="bg-primary text-primary-foreground">
                          {t(labels.save)} ${savings}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {bundleItems.map((bundleItem) => (
                          <span key={bundleItem.id} className="text-sm">
                            {CATEGORY_ICONS[bundleItem.category]}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">
                          ${bundle.bundle_price}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${individualTotal}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 rounded-full"
              onClick={handleCopyContact}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  {t(labels.copied)}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  {t(labels.copyContact)}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: t(item.title),
                    text: `${t(item.title)} - $${item.asking_price}`,
                    url: window.location.href
                  })
                }
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
