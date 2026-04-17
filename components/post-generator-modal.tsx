'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Download, Check, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/lib/app-context'
import { toast } from 'sonner'
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  getItemTitle,
  getItemDescription,
  CONTACT_PLATFORM_INFO,
  getCurrencySymbol,
  type CurrencyCode,
  type Item,
  type ContactMethod,
} from '@/lib/types'

interface PostGeneratorModalProps {
  item: Item | null
  onClose: () => void
}

type ImageSize = 'square' | 'landscape' | 'story'

function formatContactMethod(method: ContactMethod, lang: 'zh' | 'en'): string {
  const info = CONTACT_PLATFORM_INFO[method.platform]
  const platformLabel = info ? info.label[lang] : method.platform
  const labelPart = method.label ? method.label : platformLabel
  return `${labelPart}: ${method.value}`
}

function getPrimaryContactLine(methods: ContactMethod[], lang: 'zh' | 'en'): string {
  const enabled = methods.filter(m => m.enabled)
  if (enabled.length === 0) return lang === 'zh' ? '（请在后台设置联系方式）' : '(Please configure contact methods)'
  return enabled.slice(0, 2).map(m => formatContactMethod(m, lang)).join(' / ')
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  // Works for both CJK and Latin by measuring character-by-character
  const lines: string[] = []
  let current = ''
  for (const ch of text) {
    const test = current + ch
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
      continue
    }
    if (current) lines.push(current)
    current = ch
  }
  if (current) lines.push(current)
  return lines
}

function getImageRows(count: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [1]
  if (count === 2) return [2]
  if (count === 3) return [2, 1]
  if (count === 4) return [2, 2]
  if (count === 5) return [3, 2]
  if (count === 6) return [3, 3]

  const rows: number[] = []
  let remain = count
  while (remain > 0) {
    const cols = remain >= 3 ? 3 : remain
    rows.push(cols)
    remain -= cols
  }
  return rows
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 12
) {
  const scale = Math.max(width / img.width, height / img.height)
  const sw = width / scale
  const sh = height / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height)
  ctx.restore()
}

export function PostGeneratorModal({ item, onClose }: PostGeneratorModalProps) {
  const { data, t, lang } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [xiaohongshuText, setXiaohongshuText] = useState('')
  const [facebookText, setFacebookText] = useState('')
  const [discordText, setDiscordText] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageSize, setImageSize] = useState<ImageSize>('square')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const labels = {
    title: { en: 'Generate Post', zh: '生成帖子' },
    xiaohongshu: { en: 'Xiaohongshu', zh: '小红书' },
    facebook: { en: 'Facebook', zh: 'Facebook' },
    discord: { en: 'Discord', zh: 'Discord' },
    copyText: { en: 'Copy Text', zh: '复制文字' },
    copied: { en: 'Copied!', zh: '已复制！' },
    generateImage: { en: 'Generate Share Image', zh: '生成分享图' },
    downloadImage: { en: 'Download Image', zh: '下载图片' },
    imageSize: { en: 'Image Size', zh: '图片尺寸' },
    chooseImages: { en: 'Choose images to include', zh: '选择要展示的物品图片' },
    noImages: { en: 'This item has no uploaded images', zh: '该物品还没有上传图片' },
    selectAll: { en: 'Select all', zh: '全选' },
    clearAll: { en: 'Clear', zh: '清空' },
    generating: { en: 'Generating...', zh: '生成中...' },
    square: { en: 'Square (1080x1080)', zh: '正方形 (1080x1080)' },
    landscape: { en: 'Landscape (1200x628)', zh: '横版 (1200x628)' },
    story: { en: 'Story (1080x1920)', zh: '竖版 (1080x1920)' },
  }

  const imageSizes: Record<ImageSize, { width: number; height: number }> = {
    square: { width: 1080, height: 1080 },
    landscape: { width: 1200, height: 628 },
    story: { width: 1080, height: 1920 },
  }

  useEffect(() => {
    if (!item) return

    const titleZh = item.title_zh
    const titleEn = item.title_en || item.title_zh
    const descriptionZh = item.description_zh || ''
    const descriptionEn = item.description_en || item.description_zh || ''
    const notesZh = item.notes_zh || ''
    const notesEn = item.notes_en || item.notes_zh || ''
    const purchaseLink = item.purchase_link || ''

    const location = data.settings.location || ''
    const currency = (data.settings.currency || 'CAD') as CurrencyCode
    const currencySymbol = getCurrencySymbol(currency)
    const contactsZh = getPrimaryContactLine(data.contactMethods, 'zh')
    const contactsEn = getPrimaryContactLine(data.contactMethods, 'en')

    const discountPercent = item.original_price
      ? Math.round(((item.original_price - item.asking_price) / item.original_price) * 100)
      : 0
    const originalPriceLineZh = item.original_price
      ? `💰 特价出售 ${currency} ${currencySymbol}${item.asking_price}（原价 ${currencySymbol}${item.original_price}，省${discountPercent}%！）`
      : `💰 售价 ${currency} ${currencySymbol}${item.asking_price}`
    const originalPriceLineEn = item.original_price
      ? `💵 Price: ${currency} ${currencySymbol}${item.asking_price} (Originally ${currencySymbol}${item.original_price} - ${discountPercent}% OFF!)`
      : `💵 Price: ${currency} ${currencySymbol}${item.asking_price}`

    // Xiaohongshu post (Chinese)
    const xhsPost = [
      `✨ ${titleZh} ✨`,
      '',
      originalPriceLineZh,
      '',
      `📦 成色：${CONDITION_LABELS[item.condition].zh}`,
      location ? `📍 地点：${location}` : '',
      `📅 可取货时间：${item.available_from ? new Date(item.available_from).toLocaleDateString('zh-CN') : '即日起'}${item.available_until ? ` - ${new Date(item.available_until).toLocaleDateString('zh-CN')}` : ''}`,
      item.allow_viewing ? '👀 可提前看货！' : '',
      '',
      descriptionZh,
      '',
      notesZh ? `📝 备注：${notesZh}` : '',
      purchaseLink ? `🔗 原始购买链接：${purchaseLink}` : '',
      `💬 联系方式：${contactsZh}`,
      '',
      `#多伦多二手 #北约克二手 #搬家清仓 #${CATEGORY_LABELS[item.category].zh} ${item.tags?.map(tag => `#${tag}`).join(' ') || ''}`,
    ].filter(Boolean).join('\n')

    setXiaohongshuText(xhsPost)

    // Facebook post (English)
    const fbPost = [
      `🏷️ ${titleEn} [${CONDITION_LABELS[item.condition].en}]`,
      '',
      originalPriceLineEn,
      '',
      '📋 Details:',
      `• Condition: ${CONDITION_LABELS[item.condition].en}`,
      `• Category: ${CATEGORY_LABELS[item.category].en}`,
      item.allow_viewing ? '• Can view/test before purchase' : '',
      location ? `📍 Pickup: ${location}` : '',
      `📅 Available: ${item.available_from ? new Date(item.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now'}${item.available_until ? ` - ${new Date(item.available_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`,
      '',
      descriptionEn,
      '',
      notesEn ? `Note: ${notesEn}` : '',
      purchaseLink ? `🔗 Original listing: ${purchaseLink}` : '',
      `💬 Contact: ${contactsEn}`,
      '',
      `#MovingSale #SecondHand #Toronto #NorthYork #${item.category}`,
    ].filter(Boolean).join('\n')

    setFacebookText(fbPost)

    // Discord post (short English)
    const conditionStars = item.condition === 'like-new' ? '⭐⭐⭐⭐⭐'
      : item.condition === 'good' ? '⭐⭐⭐⭐'
      : item.condition === 'fair' ? '⭐⭐⭐'
      : '⭐⭐'

    const shortDesc = descriptionEn
      ? `> ${descriptionEn.slice(0, 100)}${descriptionEn.length > 100 ? '...' : ''}`
      : ''

    const dcPost = [
      `**${titleEn}** — ${currency} ${currencySymbol}${item.asking_price}`,
      '',
      shortDesc,
      '',
      `${conditionStars} ${CONDITION_LABELS[item.condition].en}`,
      location ? `📍 ${location}` : '',
      item.allow_viewing ? '👀 Viewable' : '',
      purchaseLink ? `🔗 ${purchaseLink}` : '',
      '',
      `DM me or contact: \`${contactsEn}\``,
    ].filter(Boolean).join('\n')

    setDiscordText(dcPost)
  }, [item, data.settings, data.contactMethods])

  useEffect(() => {
    if (!item) {
      setSelectedImages([])
      return
    }
    setSelectedImages(item.images.slice(0, 6))
  }, [item])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t(labels.copied))
    setTimeout(() => setCopied(false), 2000)
  }

  const generateShareImage = async () => {
    if (!item || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsGeneratingImage(true)

    try {
      const { width, height } = imageSizes[imageSize]
      canvas.width = width
      canvas.height = height

      const title = getItemTitle(item, lang)
      const description = getItemDescription(item, lang)
      const location = data.settings.location || ''
      const siteUrl = 'rsb.saikoro.me'
      const currency = (data.settings.currency || 'CAD') as CurrencyCode
      const currencySymbol = getCurrencySymbol(currency)

      ctx.fillStyle = '#faf9f7'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#e8927c'
      ctx.fillRect(0, 0, width, 8)

      const padding = 60
      const contentWidth = width - padding * 2

      // Title: automatic multiline, prevents truncation
      ctx.fillStyle = '#2d2926'
      ctx.font = imageSize === 'story' ? 'bold 54px "DM Sans", sans-serif' : 'bold 48px "DM Sans", sans-serif'
      const titleLines = wrapCanvasText(ctx, title, contentWidth)
      const maxTitleLines = imageSize === 'story' ? 3 : 2
      const titleLineHeight = imageSize === 'story' ? 62 : 54
      let y = 100
      for (let i = 0; i < Math.min(titleLines.length, maxTitleLines); i += 1) {
        const isLastVisible = i === maxTitleLines - 1 && titleLines.length > maxTitleLines
        const text = isLastVisible ? `${titleLines[i]}...` : titleLines[i]
        ctx.fillText(text, padding, y)
        y += titleLineHeight
      }

      // Price row
      ctx.fillStyle = '#e8927c'
      ctx.font = 'bold 64px "DM Sans", sans-serif'
      const priceY = y + 22
      ctx.fillText(`${currencySymbol}${item.asking_price}`, padding, priceY)

      if (item.original_price) {
        ctx.fillStyle = '#8a8480'
        ctx.font = '32px "DM Sans", sans-serif'
        ctx.fillText(`Original: ${currencySymbol}${item.original_price}`, padding + 220, priceY - 5)
      }

      // Description
      let contentBottomY = priceY + 18
      if (description) {
        ctx.fillStyle = '#2d2926'
        ctx.font = '28px "DM Sans", sans-serif'
        const maxChars = imageSize === 'story' ? 280 : 180
        const desc = description.slice(0, maxChars) + (description.length > maxChars ? '...' : '')
        const lines = wrapCanvasText(ctx, desc, contentWidth)
        const maxLines = imageSize === 'story' ? 8 : 3
        let descY = priceY + 60
        for (let i = 0; i < Math.min(lines.length, maxLines); i += 1) {
          const isLastVisible = i === maxLines - 1 && lines.length > maxLines
          const text = isLastVisible ? `${lines[i]}...` : lines[i]
          ctx.fillText(text, padding, descY)
          descY += 36
        }
        contentBottomY = descY
      }

      // Optional image gallery in lower area
      const selected = selectedImages.filter(Boolean)
      if (selected.length > 0) {
        const loaded = await Promise.allSettled(selected.map((src) => loadImage(src)))
        const images = loaded
          .filter((r): r is PromiseFulfilledResult<HTMLImageElement> => r.status === 'fulfilled')
          .map((r) => r.value)

        if (images.length > 0) {
          const brandingY = height - 40
          const galleryTop = Math.min(contentBottomY + 24, height * 0.55)
          const galleryBottom = brandingY - 24
          const galleryHeight = Math.max(0, galleryBottom - galleryTop)

          if (galleryHeight > 80) {
            const rows = getImageRows(images.length)
            const maxCols = Math.max(...rows)
            const gap = 16
            const slotWidth = (contentWidth - (maxCols - 1) * gap) / maxCols
            const slotHeight = (galleryHeight - (rows.length - 1) * gap) / rows.length

            let imageIdx = 0
            let rowY = galleryTop
            for (const cols of rows) {
              const rowWidth = cols * slotWidth + (cols - 1) * gap
              let x = padding + (contentWidth - rowWidth) / 2 // center sparse rows
              for (let c = 0; c < cols && imageIdx < images.length; c += 1) {
                drawImageCover(ctx, images[imageIdx], x, rowY, slotWidth, slotHeight, 14)
                x += slotWidth + gap
                imageIdx += 1
              }
              rowY += slotHeight + gap
            }
          }
        }
      }

      // Branding footer
      ctx.fillStyle = '#8a8480'
      ctx.font = '24px "DM Sans", sans-serif'
      const brandText = 'ResaleBox · 断舍离中心'
      ctx.fillText(brandText, padding, height - 40)
      const rightText = siteUrl || location
      if (rightText) {
        ctx.fillText(rightText, width - padding - ctx.measureText(rightText).width, height - 40)
      }

      const link = document.createElement('a')
      const filename = (item.title_en || item.title_zh || 'item')
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
      link.download = `${filename || 'item'}-share.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error(err)
      toast.error(lang === 'zh' ? '生成图片失败，请重试' : 'Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(labels.title)}: {getItemTitle(item, lang)}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="xiaohongshu">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="xiaohongshu">{t(labels.xiaohongshu)}</TabsTrigger>
            <TabsTrigger value="facebook">{t(labels.facebook)}</TabsTrigger>
            <TabsTrigger value="discord">{t(labels.discord)}</TabsTrigger>
          </TabsList>

          <TabsContent value="xiaohongshu" className="space-y-4 pt-4">
            <Textarea
              value={xiaohongshuText}
              onChange={(e) => setXiaohongshuText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => handleCopy(xiaohongshuText)}
              className="w-full rounded-full"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? t(labels.copied) : t(labels.copyText)}
            </Button>
          </TabsContent>

          <TabsContent value="facebook" className="space-y-4 pt-4">
            <Textarea
              value={facebookText}
              onChange={(e) => setFacebookText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => handleCopy(facebookText)}
              className="w-full rounded-full"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? t(labels.copied) : t(labels.copyText)}
            </Button>
          </TabsContent>

          <TabsContent value="discord" className="space-y-4 pt-4">
            <Textarea
              value={discordText}
              onChange={(e) => setDiscordText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => handleCopy(discordText)}
              className="w-full rounded-full"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? t(labels.copied) : t(labels.copyText)}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Share image generator */}
        <div className="border-t pt-4 mt-4 space-y-4">
          {item.images.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t(labels.chooseImages)}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setSelectedImages(item.images.slice(0, 6))}
                  >
                    {t(labels.selectAll)}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setSelectedImages([])}
                  >
                    {t(labels.clearAll)}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {item.images.slice(0, 8).map((src, idx) => {
                  const selected = selectedImages.includes(src)
                  return (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedImages((prev) => (
                          prev.includes(src)
                            ? prev.filter((v) => v !== src)
                            : [...prev, src]
                        ))
                      }}
                      className={`relative aspect-square overflow-hidden rounded-md border-2 transition ${selected ? 'border-primary ring-1 ring-primary/40' : 'border-transparent'}`}
                      title={selected ? 'selected' : 'not selected'}
                    >
                      <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                      {selected && (
                        <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              {t(labels.noImages)}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Select value={imageSize} onValueChange={(v) => setImageSize(v as ImageSize)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t(labels.imageSize)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">{t(labels.square)}</SelectItem>
                <SelectItem value="landscape">{t(labels.landscape)}</SelectItem>
                <SelectItem value="story">{t(labels.story)}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={generateShareImage}
              disabled={isGeneratingImage}
              className="flex-1 rounded-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingImage ? t(labels.generating) : t(labels.downloadImage)}
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
