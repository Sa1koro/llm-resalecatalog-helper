'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Download, Check } from 'lucide-react'
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
  type Item 
} from '@/lib/types'

interface PostGeneratorModalProps {
  item: Item | null
  onClose: () => void
}

type ImageSize = 'square' | 'landscape' | 'story'

export function PostGeneratorModal({ item, onClose }: PostGeneratorModalProps) {
  const { data, t, lang } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [xiaohongshuText, setXiaohongshuText] = useState('')
  const [facebookText, setFacebookText] = useState('')
  const [discordText, setDiscordText] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageSize, setImageSize] = useState<ImageSize>('square')

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

    const discountPercent = Math.round(
      ((item.original_price - item.asking_price) / item.original_price) * 100
    )

    // Generate Xiaohongshu post
    const xhsPost = `✨ ${item.title.zh} ✨

💰 特价出售 CAD $${item.asking_price}（原价 $${item.original_price}，省${discountPercent}%！）

📦 成色：${CONDITION_LABELS[item.condition].zh}
📍 地点：${data.meta.location}
📅 可取货时间：${item.available_from ? new Date(item.available_from).toLocaleDateString('zh-CN') : '即日起'}${item.available_until ? ` - ${new Date(item.available_until).toLocaleDateString('zh-CN')}` : ''}
${item.allow_viewing ? '👀 可提前看货！' : ''}

${item.description.zh}

${item.notes?.zh ? `📝 备注：${item.notes.zh}\n` : ''}
💬 联系方式：${data.meta.contact}

#多伦多二手 #北约克二手 #搬家清仓 #${CATEGORY_LABELS[item.category].zh} ${item.tags?.map(tag => `#${tag}`).join(' ') || ''}`

    setXiaohongshuText(xhsPost)

    // Generate Facebook post
    const fbPost = `🏷️ ${item.title.en} [${CONDITION_LABELS[item.condition].en}]

💵 Price: CAD $${item.asking_price} (Originally $${item.original_price} - ${discountPercent}% OFF!)

📋 Details:
• Condition: ${CONDITION_LABELS[item.condition].en}
• Category: ${CATEGORY_LABELS[item.category].en}
${item.allow_viewing ? '• Can view/test before purchase\n' : ''}
📍 Pickup: ${data.meta.location}
📅 Available: ${item.available_from ? new Date(item.available_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now'}${item.available_until ? ` - ${new Date(item.available_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}

${item.description.en}

${item.notes?.en ? `Note: ${item.notes.en}\n` : ''}
💬 Contact: ${data.meta.contact}

#MovingSale #SecondHand #Toronto #NorthYork #${item.category}`

    setFacebookText(fbPost)

    // Generate Discord post
    const conditionStars = item.condition === 'like-new' ? '⭐⭐⭐⭐⭐' 
      : item.condition === 'good' ? '⭐⭐⭐⭐' 
      : item.condition === 'fair' ? '⭐⭐⭐' 
      : '⭐⭐'

    const dcPost = `**${item.title.en}** — CAD $${item.asking_price}

> ${item.description.en.slice(0, 100)}${item.description.en.length > 100 ? '...' : ''}

${conditionStars} ${CONDITION_LABELS[item.condition].en}
📍 ${data.meta.location}
${item.allow_viewing ? '👀 Viewable' : ''}

DM me or contact: \`${data.meta.contact}\``

    setDiscordText(dcPost)
  }, [item, data.meta])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t(labels.copied))
    setTimeout(() => setCopied(false), 2000)
  }

  const generateShareImage = () => {
    if (!item || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = imageSizes[imageSize]
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = '#faf9f7'
    ctx.fillRect(0, 0, width, height)

    // Accent stripe
    ctx.fillStyle = '#e8927c'
    ctx.fillRect(0, 0, width, 8)

    // Content area
    const padding = 60
    const contentWidth = width - padding * 2

    // Title
    ctx.fillStyle = '#2d2926'
    ctx.font = 'bold 48px "DM Sans", sans-serif'
    ctx.fillText(item.title[lang], padding, 100)

    // Price
    ctx.fillStyle = '#e8927c'
    ctx.font = 'bold 64px "DM Sans", sans-serif'
    ctx.fillText(`$${item.asking_price}`, padding, 180)

    ctx.fillStyle = '#8a8480'
    ctx.font = '32px "DM Sans", sans-serif'
    ctx.fillText(`Original: $${item.original_price}`, padding + 200, 175)

    // Description
    ctx.fillStyle = '#2d2926'
    ctx.font = '28px "DM Sans", sans-serif'
    const desc = item.description[lang].slice(0, 150) + (item.description[lang].length > 150 ? '...' : '')
    const words = desc.split(' ')
    let line = ''
    let y = 240
    for (const word of words) {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > contentWidth) {
        ctx.fillText(line, padding, y)
        line = word + ' '
        y += 36
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, padding, y)

    // Branding
    ctx.fillStyle = '#8a8480'
    ctx.font = '24px "DM Sans", sans-serif'
    ctx.fillText('ResaleBox · 断舍离中心', padding, height - 40)
    ctx.fillText(data.meta.location, width - padding - ctx.measureText(data.meta.location).width, height - 40)

    // Download
    const link = document.createElement('a')
    link.download = `${item.title.en.toLowerCase().replace(/\s+/g, '-')}-share.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(labels.title)}: {t(item.title)}</DialogTitle>
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
              className="flex-1 rounded-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {t(labels.downloadImage)}
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
