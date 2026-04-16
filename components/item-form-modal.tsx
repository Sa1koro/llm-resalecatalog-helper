'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/lib/app-context'
import { ImageUpload } from '@/components/image-upload'
import { toast } from 'sonner'
import { 
  CATEGORY_LABELS, 
  CATEGORY_ICONS,
  CONDITION_LABELS,
  STATUS_LABELS,
  getBundleName,
  type Item,
  type Category,
  type Condition,
  type ItemStatus
} from '@/lib/types'

interface ItemFormModalProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES: Category[] = ['furniture', 'electronics', 'kitchen', 'sports', 'clothing', 'books', 'other']
const CONDITIONS: Condition[] = ['like-new', 'good', 'fair', 'well-loved']
const STATUSES: ItemStatus[] = ['available', 'reserved', 'sold']

export function ItemFormModal({ item, isOpen, onClose }: ItemFormModalProps) {
  const { t, lang, addItem, updateItem, data } = useApp()
  const isEditing = !!item

  const labels = {
    addTitle: { en: 'Add New Item', zh: '添加新物品' },
    editTitle: { en: 'Edit Item', zh: '编辑物品' },
    titleEn: { en: 'Title (English)', zh: '标题（英文）' },
    titleZh: { en: 'Title (Chinese) *', zh: '标题（中文）*' },
    category: { en: 'Category', zh: '分类' },
    condition: { en: 'Condition', zh: '成色' },
    status: { en: 'Status', zh: '状态' },
    originalPrice: { en: 'Original Price', zh: '原价' },
    askingPrice: { en: 'Asking Price *', zh: '售价 *' },
    descriptionEn: { en: 'Description (English)', zh: '描述（英文）' },
    descriptionZh: { en: 'Description (Chinese)', zh: '描述（中文）' },
    tags: { en: 'Tags (comma separated)', zh: '标签（逗号分隔）' },
    images: { en: 'Images', zh: '图片' },
    bundle: { en: 'Bundle', zh: '套装' },
    noBundle: { en: 'No bundle', zh: '不加入套装' },
    featured: { en: 'Featured', zh: '推荐' },
    featuredDescription: { en: 'Show this item prominently', zh: '在首页显著位置展示此物品' },
    save: { en: 'Save', zh: '保存' },
    cancel: { en: 'Cancel', zh: '取消' },
    basic: { en: 'Basic Info', zh: '基本信息' },
    details: { en: 'Details', zh: '详细信息' },
    media: { en: 'Images', zh: '图片' },
    saved: { en: 'Item saved!', zh: '物品已保存！' },
    error: { en: 'Failed to save', zh: '保存失败' },
  }

  // Form state
  const [titleEn, setTitleEn] = useState('')
  const [titleZh, setTitleZh] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [condition, setCondition] = useState<Condition>('good')
  const [status, setStatus] = useState<ItemStatus>('available')
  const [originalPrice, setOriginalPrice] = useState('')
  const [askingPrice, setAskingPrice] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionZh, setDescriptionZh] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [bundleId, setBundleId] = useState<string | null>(null)
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setTitleEn(item.title_en || '')
      setTitleZh(item.title_zh)
      setCategory(item.category)
      setCondition(item.condition)
      setStatus(item.status)
      setOriginalPrice(item.original_price?.toString() || '')
      setAskingPrice(item.asking_price.toString())
      setDescriptionEn(item.description_en || '')
      setDescriptionZh(item.description_zh || '')
      setTags(item.tags?.join(', ') || '')
      setImages(item.images || [])
      setBundleId(item.bundle_id)
      setFeatured(item.featured)
    } else {
      // Reset to defaults
      setTitleEn('')
      setTitleZh('')
      setCategory('other')
      setCondition('good')
      setStatus('available')
      setOriginalPrice('')
      setAskingPrice('')
      setDescriptionEn('')
      setDescriptionZh('')
      setTags('')
      setImages([])
      setBundleId(null)
      setFeatured(false)
    }
  }, [item, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titleZh.trim()) {
      toast.error(lang === 'zh' ? '请输入中文标题' : 'Please enter Chinese title')
      return
    }

    if (!askingPrice || parseFloat(askingPrice) <= 0) {
      toast.error(lang === 'zh' ? '请输入有效的售价' : 'Please enter a valid asking price')
      return
    }

    setSaving(true)

    try {
      const itemData = {
        title_zh: titleZh.trim(),
        title_en: titleEn.trim() || null,
        category,
        condition,
        status,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        asking_price: parseFloat(askingPrice),
        description_zh: descriptionZh.trim() || null,
        description_en: descriptionEn.trim() || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        bundle_id: bundleId,
        featured,
        sort_order: item?.sort_order ?? data.items.length,
      }

      if (isEditing && item) {
        await updateItem(item.id, itemData)
      } else {
        await addItem(itemData)
      }

      toast.success(t(labels.saved))
      onClose()
    } catch (error) {
      toast.error(t(labels.error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? labels.editTitle : labels.addTitle)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{t(labels.basic)}</TabsTrigger>
              <TabsTrigger value="details">{t(labels.details)}</TabsTrigger>
              <TabsTrigger value="media">{t(labels.media)}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              {/* Title fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(labels.titleZh)}</Label>
                  <Input
                    value={titleZh}
                    onChange={(e) => setTitleZh(e.target.value)}
                    placeholder="宜家MALM床架"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.titleEn)}</Label>
                  <Input
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="IKEA MALM Bed Frame"
                  />
                </div>
              </div>

              {/* Category, Condition, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t(labels.category)}</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {t(CATEGORY_LABELS[cat])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.condition)}</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {t(CONDITION_LABELS[cond])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.status)}</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(STATUS_LABELS[s])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(labels.originalPrice)} (¥)</Label>
                  <Input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="299"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.askingPrice)} (¥)</Label>
                  <Input
                    type="number"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="120"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Bundle selection */}
              {data.bundles.length > 0 && (
                <div className="space-y-2">
                  <Label>{t(labels.bundle)}</Label>
                  <Select 
                    value={bundleId || 'none'} 
                    onValueChange={(v) => setBundleId(v === 'none' ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t(labels.noBundle)}</SelectItem>
                      {data.bundles.map((bundle) => (
                        <SelectItem key={bundle.id} value={bundle.id}>
                          {getBundleName(bundle, lang)} ({bundle.discount_percent}% off)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>{t(labels.featured)}</Label>
                  <p className="text-sm text-muted-foreground">{t(labels.featuredDescription)}</p>
                </div>
                <Switch
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Descriptions */}
              <div className="space-y-2">
                <Label>{t(labels.descriptionZh)}</Label>
                <Textarea
                  value={descriptionZh}
                  onChange={(e) => setDescriptionZh(e.target.value)}
                  placeholder="用中文描述物品..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t(labels.descriptionEn)}</Label>
                <Textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Describe the item in English..."
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>{t(labels.tags)}</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="bedroom, ikea, white"
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 pt-4">
              {/* Images */}
              <div className="space-y-2">
                <Label>{t(labels.images)}</Label>
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={10}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {t(labels.cancel)}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (lang === 'zh' ? '保存中...' : 'Saving...') : t(labels.save)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
