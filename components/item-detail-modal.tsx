'use client'

import { useState, useEffect } from 'react'
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
  Check,
  Link as LinkIcon
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useApp } from '@/lib/app-context'
import { toast } from 'sonner'
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CONDITION_LABELS,
  STATUS_LABELS,
  getItemTitle,
  getItemDescription,
  getBundleName,
  getPriorityLabel,
  getPriorityColor,
  formatPrice,
  type Item
} from '@/lib/types'
import { Flame, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemDetailModalProps {
  item: Item | null
  onClose: () => void
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const { data, t, lang, getBundleById, getItemsInBundle, calculateBundlePrice, calculateBundleSavings } = useApp()
  const currency = data.settings.currency || 'CAD'
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)

  // Reset image index whenever a different item is opened
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [item?.id])

  if (!item) return null

  const bundle = item.bundle_id ? getBundleById(item.bundle_id) : null
  const discountPercent = item.original_price 
    ? Math.round(((item.original_price - item.asking_price) / item.original_price) * 100)
    : 0
  const isSold = item.status === 'sold'
  const isReserved = item.status === 'reserved'

  const labels = {
    originalPrice: { en: 'Original price', zh: '原价' },
    askingPrice: { en: 'Asking price', zh: '售价' },
    condition: { en: 'Condition', zh: '成色' },
    category: { en: 'Category', zh: '分类' },
    copyLink: { en: 'Copy Link', zh: '复制链接' },
    share: { en: 'Share', zh: '分享' },
    shareText: { en: 'Share Text', zh: '分享文案' },
    bundleDeal: { en: 'Bundle Deal', zh: '打包优惠' },
    save: { en: 'Save', zh: '省' },
    tags: { en: 'Tags', zh: '标签' },
    copied: { en: 'Copied!', zh: '已复制！' },
    linkCopied: { en: 'Link copied!', zh: '链接已复制！' },
    textCopied: { en: 'Share text copied!', zh: '分享文案已复制！' },
    shareVia: { en: 'Share via', zh: '分享到' },
    availability: { en: 'Availability', zh: '可取货时间' },
    priority: { en: 'Sell Priority', zh: '出售优先级' },
    originalListing: { en: 'Original listing', zh: '原始商品链接' },
    availableNow: { en: 'Available Now', zh: '即日起可取' },
    until: { en: 'until', zh: '截止' },
  }

  const availableFromDate = item.available_from ? new Date(item.available_from) : null
  const availableUntilDate = item.available_until ? new Date(item.available_until) : null
  const dateLocale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const longDateOpts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  const hasAvailability = availableFromDate || availableUntilDate
  const availabilityText = (() => {
    if (!hasAvailability) return t(labels.availableNow)
    const fromStr = availableFromDate
      ? availableFromDate.toLocaleDateString(dateLocale, longDateOpts)
      : t(labels.availableNow)
    const untilStr = availableUntilDate
      ? availableUntilDate.toLocaleDateString(dateLocale, longDateOpts)
      : null
    return untilStr ? `${fromStr} — ${untilStr}` : fromStr
  })()

  const priority = item.sell_priority || 5
  const priorityLabel = getPriorityLabel(priority)
  const priorityColor = getPriorityColor(priority)
  const showPriorityBadge = priority <= 4

  const getItemUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/#shop/item/${item.id}`
  }

  const generateShareText = () => {
    const title = getItemTitle(item, lang)
    const price = formatPrice(item.asking_price, currency)
    const condition = t(CONDITION_LABELS[item.condition])
    const description = getItemDescription(item, lang)
    
    if (lang === 'zh') {
      return `【${title}】
售价: ${price}${item.original_price ? ` (原价 ${formatPrice(item.original_price, currency)})` : ''}
成色: ${condition}
${description ? `\n${description}\n` : ''}
${item.purchase_link ? `原始链接: ${item.purchase_link}\n` : ''}
链接: ${getItemUrl()}`
    }
    
    return `【${title}】
Price: ${price}${item.original_price ? ` (was ${formatPrice(item.original_price, currency)})` : ''}
Condition: ${condition}
${description ? `\n${description}\n` : ''}
${item.purchase_link ? `Original listing: ${item.purchase_link}\n` : ''}
Link: ${getItemUrl()}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getItemUrl())
    setCopiedLink(true)
    toast.success(t(labels.linkCopied))
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(generateShareText())
    toast.success(t(labels.textCopied))
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getItemTitle(item, lang),
          text: generateShareText(),
          url: getItemUrl()
        })
      } catch (err) {
        // User cancelled or share failed - ignore
      }
    } else {
      // Fallback - copy share text
      handleCopyShareText()
    }
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
                alt={getItemTitle(item, lang)}
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
            {t(STATUS_LABELS[item.status])}
          </Badge>
        </div>
        
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-serif">
              {getItemTitle(item, lang)}
            </DialogTitle>
          </DialogHeader>
          
          {/* Price block */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(item.asking_price, currency)}
            </span>
            {item.original_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(item.original_price, currency)}
                </span>
                {discountPercent > 0 && (
                  <Badge className="bg-primary text-primary-foreground">
                    -{discountPercent}%
                  </Badge>
                )}
              </>
            )}
          </div>
          
          {/* Description */}
          {getItemDescription(item, lang) && (
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {getItemDescription(item, lang)}
            </p>
          )}
          
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
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">
                {t(labels.availability)}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {availabilityText}
              </span>
            </div>
            {showPriorityBadge && (
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  {t(labels.priority)}
                </p>
                <Badge className={cn('border', priorityColor)}>
                  <Flame className="h-3 w-3 mr-1" />
                  {priorityLabel[lang]}
                </Badge>
              </div>
            )}
          </div>

          {item.purchase_link && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase mb-2">
                {t(labels.originalListing)}
              </p>
              <a
                href={item.purchase_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {item.purchase_link}
              </a>
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
          
          {/* Bundle section */}
          {bundle && bundle.enabled && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                {t(labels.bundleDeal)}
              </p>
              {(() => {
                const bundleItems = getItemsInBundle(bundle.id)
                const bundlePrice = calculateBundlePrice(bundle)
                const savings = calculateBundleSavings(bundle)
                const totalIndividual = bundleItems.reduce((sum, i) => sum + i.asking_price, 0)
                
                return (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{getBundleName(bundle, lang)}</h4>
                        <Badge className="bg-primary text-primary-foreground">
                          {t(labels.save)} {formatPrice(Number(savings.toFixed(0)), currency)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {bundleItems.map((bundleItem) => (
                          <span key={bundleItem.id} className="text-sm">
                            {CATEGORY_ICONS[bundleItem.category]}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          ({bundleItems.length} {lang === 'zh' ? '件物品' : 'items'})
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(Number(bundlePrice.toFixed(0)), currency)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(totalIndividual, currency)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({bundle.discount_percent}% off)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  {t(labels.copied)}
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-1.5" />
                  {t(labels.copyLink)}
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="flex-1 rounded-full"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  {t(labels.share)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyShareText}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t(labels.shareText)}
                </DropdownMenuItem>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <DropdownMenuItem onClick={handleNativeShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {t(labels.shareVia)}...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
