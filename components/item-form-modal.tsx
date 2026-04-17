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
import { Slider } from '@/components/ui/slider'
import { useApp } from '@/lib/app-context'
import { ImageUpload } from '@/components/image-upload'
import { toast } from 'sonner'
import { 
  CATEGORY_LABELS, 
  CATEGORY_ICONS,
  CONDITION_LABELS,
  STATUS_LABELS,
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
  const { addItem, updateItem, data, lang } = useApp()
  const bundles = data.bundles
  const currency = data.settings.currency || 'CAD'
  const language = lang || 'zh'
  const isEditing = !!item

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
  const [availableFrom, setAvailableFrom] = useState('')
  const [availableUntil, setAvailableUntil] = useState('')
  const [sellPriority, setSellPriority] = useState(5)
  const [allowViewing, setAllowViewing] = useState(true)
  const [purchaseLink, setPurchaseLink] = useState('')
  const [notesZh, setNotesZh] = useState('')
  const [notesEn, setNotesEn] = useState('')
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
      setAvailableFrom(item.available_from || '')
      setAvailableUntil(item.available_until || '')
      setSellPriority(item.sell_priority || 5)
      setAllowViewing(item.allow_viewing !== false)
      setPurchaseLink(item.purchase_link || '')
      setNotesZh(item.notes_zh || '')
      setNotesEn(item.notes_en || '')
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
      setAvailableFrom('')
      setAvailableUntil('')
      setSellPriority(5)
      setAllowViewing(true)
      setPurchaseLink('')
      setNotesZh('')
      setNotesEn('')
    }
  }, [item, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titleZh.trim()) {
      toast.error(language === 'zh' ? '请输入中文标题' : 'Please enter Chinese title')
      return
    }

    if (!askingPrice || parseFloat(askingPrice) <= 0) {
      toast.error(language === 'zh' ? '请输入有效的售价' : 'Please enter a valid asking price')
      return
    }

    setSaving(true)

    try {
      const itemData: any = {
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
        available_from: availableFrom || null,
        available_until: availableUntil || null,
        sell_priority: sellPriority,
        allow_viewing: allowViewing,
        purchase_link: purchaseLink || null,
        notes_zh: notesZh || null,
        notes_en: notesEn || null,
      }

      if (isEditing && item) {
        await updateItem(item.id, itemData)
      } else {
        await addItem(itemData)
      }

      toast.success(language === 'zh' ? '物品已保存' : 'Item saved')
      onClose()
    } catch (error) {
      toast.error(language === 'zh' ? '保存失败' : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const texts = {
    en: {
      addTitle: 'Add New Item',
      editTitle: 'Edit Item',
      titleEn: 'Title (English)',
      titleZh: 'Title (Chinese) *',
      category: 'Category',
      condition: 'Condition',
      status: 'Status',
      originalPrice: 'Original Price',
      askingPrice: 'Asking Price *',
      descriptionEn: 'Description (English)',
      descriptionZh: 'Description (Chinese)',
      tags: 'Tags (comma separated)',
      images: 'Images',
      bundle: 'Bundle',
      noBundle: 'No bundle',
      featured: 'Featured',
      featuredDescription: 'Show prominently on homepage',
      availableFrom: 'Available From',
      availableUntil: 'Available Until',
      sellPriority: 'Sell Priority',
      sellPriorityDesc: '1 (最优先), 5 (中等), 10 (最后出)',
      allowViewing: 'Allow Viewing',
      allowViewingDesc: 'Buyer can request viewing',
      purchaseLink: 'Purchase Link (optional)',
      notesZh: 'Notes (Chinese)',
      notesEn: 'Notes (English)',
      save: 'Save',
      cancel: 'Cancel',
      basicInfo: 'Basic Info',
      availability: 'Availability',
      sellingStrategy: 'Selling Strategy',
      media: 'Images',
      saved: 'Item saved!',
      error: 'Failed to save',
    },
    zh: {
      addTitle: '添加新物品',
      editTitle: '编辑物品',
      titleEn: '标题（英文）',
      titleZh: '标题（中文）*',
      category: '分类',
      condition: '成色',
      status: '状态',
      originalPrice: '原价',
      askingPrice: '售价 *',
      descriptionEn: '描述（英文）',
      descriptionZh: '描述（中文）',
      tags: '标签（逗号分隔）',
      images: '图片',
      bundle: '套装',
      noBundle: '不加入套装',
      featured: '推荐',
      featuredDescription: '在首页显著位置展示',
      availableFrom: '从何时可买',
      availableUntil: '截止日期',
      sellPriority: '出售优先级',
      sellPriorityDesc: '1 (最优先), 5 (中等), 10 (最后出)',
      allowViewing: '允许看货',
      allowViewingDesc: '买家可以请求看货',
      purchaseLink: '购买链接（可选）',
      notesZh: '备注（中文）',
      notesEn: '备注（英文）',
      save: '保存',
      cancel: '取消',
      basicInfo: '基本信息',
      availability: '可用期限',
      sellingStrategy: '销售策略',
      media: '图片',
      saved: '物品已保存！',
      error: '保存失败',
    }
  }

  const t = texts[language]

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t.editTitle : t.addTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">{t.basicInfo}</TabsTrigger>
              <TabsTrigger value="availability">{t.availability}</TabsTrigger>
              <TabsTrigger value="strategy">{t.sellingStrategy}</TabsTrigger>
              <TabsTrigger value="media">{t.media}</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              {/* Title fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.titleZh}</Label>
                  <Input
                    value={titleZh}
                    onChange={(e) => setTitleZh(e.target.value)}
                    placeholder="宜家MALM床架"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.titleEn}</Label>
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
                  <Label>{t.category}</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {language === 'zh' ? CATEGORY_LABELS[cat].zh : CATEGORY_LABELS[cat].en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.condition}</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {language === 'zh' ? CONDITION_LABELS[cond].zh : CONDITION_LABELS[cond].en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.status}</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {language === 'zh' ? STATUS_LABELS[s].zh : STATUS_LABELS[s].en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.originalPrice} ({currency})</Label>
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
                  <Label>{t.askingPrice} ({currency})</Label>
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
              {bundles && bundles.length > 0 && (
                <div className="space-y-2">
                  <Label>{t.bundle}</Label>
                  <Select 
                    value={bundleId || 'none'} 
                    onValueChange={(v) => setBundleId(v === 'none' ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t.noBundle}</SelectItem>
                      {bundles.map((bundle) => (
                        <SelectItem key={bundle.id} value={bundle.id}>
                          {language === 'zh' ? bundle.name_zh : (bundle.name_en || bundle.name_zh)} ({bundle.discount_percent}% off)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>{t.featured}</Label>
                  <p className="text-sm text-muted-foreground">{t.featuredDescription}</p>
                </div>
                <Switch
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <Label>{t.descriptionZh}</Label>
                <Textarea
                  value={descriptionZh}
                  onChange={(e) => setDescriptionZh(e.target.value)}
                  placeholder="用中文描述物品..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.descriptionEn}</Label>
                <Textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Describe the item in English..."
                  rows={2}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>{t.tags}</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="bedroom, ikea, white"
                />
              </div>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t.availableFrom}</Label>
                <Input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
                <p className="text-xs text-gray-500">{language === 'zh' ? '物品何时可以购买' : 'When the item becomes available for purchase'}</p>
              </div>

              <div className="space-y-2">
                <Label>{t.availableUntil}</Label>
                <Input
                  type="date"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                />
                <p className="text-xs text-gray-500">{language === 'zh' ? '物品截止销售日期' : 'Latest date item is available for purchase'}</p>
              </div>

              {/* Allow Viewing */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>{t.allowViewing}</Label>
                  <p className="text-sm text-muted-foreground">{t.allowViewingDesc}</p>
                </div>
                <Switch
                  checked={allowViewing}
                  onCheckedChange={setAllowViewing}
                />
              </div>
            </TabsContent>

            {/* Selling Strategy Tab */}
            <TabsContent value="strategy" className="space-y-4 pt-4">
              {/* Sell Priority */}
              <div className="space-y-3">
                <div>
                  <Label>{t.sellPriority}</Label>
                  <p className="text-xs text-gray-500 mb-2">{t.sellPriorityDesc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[sellPriority]}
                    onValueChange={(value) => setSellPriority(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold w-8 text-center">{sellPriority}</span>
                </div>
              </div>

              {/* Purchase Link */}
              <div className="space-y-2">
                <Label>{t.purchaseLink}</Label>
                <Input
                  value={purchaseLink}
                  onChange={(e) => setPurchaseLink(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500">{language === 'zh' ? '如果在其他平台也在出售，可以添加链接' : 'Link if also selling on other platforms'}</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>{t.notesZh}</Label>
                <Textarea
                  value={notesZh}
                  onChange={(e) => setNotesZh(e.target.value)}
                  placeholder={language === 'zh' ? '添加任何附加信息或特殊说明...' : 'Add any additional information...'}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.notesEn}</Label>
                <Textarea
                  value={notesEn}
                  onChange={(e) => setNotesEn(e.target.value)}
                  placeholder="Add any additional information..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t.images}</Label>
                <ImageUpload
                  onUpload={(url) => {
                    setImages([...images, url])
                  }}
                  isLoading={false}
                />
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Item ${idx}`} className="w-full aspect-square object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Form actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '...' : t.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
