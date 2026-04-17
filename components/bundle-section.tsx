'use client'

import { Gift } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/app-context'
import { CATEGORY_ICONS, getBundleName, getBundleDescription, getItemTitle, formatPrice, type Item } from '@/lib/types'

interface BundleSectionProps {
  onItemClick: (item: Item) => void
}

export function BundleSection({ onItemClick }: BundleSectionProps) {
  const { data, lang, t, getItemsInBundle, calculateBundleSavings, calculateBundlePrice } = useApp()
  const currency = data.settings.currency || 'CAD'

  const sectionTitle = { en: 'Bundle Deals', zh: '打包优惠' }
  const saveLabel = { en: 'Save', zh: '省' }
  const viewBundleLabel = { en: 'View Bundle', zh: '查看套装' }
  const individualPriceLabel = { en: 'Individual price', zh: '单买价格' }
  const bundlePriceLabel = { en: 'Bundle price', zh: '套装价格' }

  const enabledBundles = data.bundles.filter(b => b.enabled)
  
  if (enabledBundles.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Gift className="h-6 w-6 text-primary" />
        {t(sectionTitle)}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enabledBundles.map((bundle) => {
          const items = getItemsInBundle(bundle.id)
          const bundlePrice = calculateBundlePrice(bundle)
          const savings = calculateBundleSavings(bundle)
          const individualTotal = items.reduce((sum, i) => sum + i.asking_price, 0)
          
          if (items.length === 0) return null

          return (
            <Card key={bundle.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {getBundleName(bundle, lang)}
                  </CardTitle>
                  <Badge className="bg-primary text-primary-foreground relative overflow-hidden">
                    <span className="relative z-10">
                      {t(saveLabel)} {formatPrice(Number(savings.toFixed(0)), currency)}
                    </span>
                    <span className="absolute inset-0 animate-shimmer" />
                  </Badge>
                </div>
                {getBundleDescription(bundle, lang) && (
                  <p className="text-sm text-muted-foreground">
                    {getBundleDescription(bundle, lang)}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Item thumbnails */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted overflow-hidden hover:ring-2 ring-primary transition-all"
                    >
                      {item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={getItemTitle(item, lang)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">
                            {CATEGORY_ICONS[item.category]}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Price comparison */}
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t(individualPriceLabel)}</p>
                    <p className="text-sm line-through text-muted-foreground">
                      {formatPrice(individualTotal, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t(bundlePriceLabel)}</p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(Number(bundlePrice.toFixed(0)), currency)}
                    </p>
                  </div>
                </div>
                
                {/* Item list */}
                <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[item.category]}</span>
                      <span className="line-clamp-1">{getItemTitle(item, lang)}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-full"
                  onClick={() => items[0] && onItemClick(items[0])}
                >
                  {t(viewBundleLabel)}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
