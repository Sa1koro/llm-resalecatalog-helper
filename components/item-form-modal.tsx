'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Upload, Plus, Trash2, Eye } from 'lucide-react'
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
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/app-context'
import { toast } from 'sonner'
import { 
  CATEGORY_LABELS, 
  CATEGORY_ICONS,
  CONDITION_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type Item,
  type Category,
  type Condition,
  type ItemStatus,
  type BilingualText
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
    titleZh: { en: 'Title (Chinese)', zh: '标题（中文）' },
    category: { en: 'Category', zh: '分类' },
    condition: { en: 'Condition', zh: '成色' },
    status: { en: 'Status', zh: '状态' },
    originalPrice: { en: 'Original Price', zh: '原价' },
    askingPrice: { en: 'Asking Price', zh: '售价' },
    descriptionEn: { en: 'Description (English)', zh: '描述（英文）' },
    descriptionZh: { en: 'Description (Chinese)', zh: '描述（中文）' },
    purchaseLink: { en: 'Original Purchase Link', zh: '原商品链接' },
    availableFrom: { en: 'Available From', zh: '开始日期' },
    availableUntil: { en: 'Available Until', zh: '截止日期' },
    allowViewing: { en: 'Allow viewing before purchase', zh: '允许购买前查看' },
    priority: { en: 'Sell Priority', zh: '出售优先级' },
    tags: { en: 'Tags (comma separated)', zh: '标签（逗号分隔）' },
    notesEn: { en: 'Notes (English)', zh: '备注（英文）' },
    notesZh: { en: 'Notes (Chinese)', zh: '备注（中文）' },
    images: { en: 'Images', zh: '图片' },
    uploadImages: { en: 'Upload Images', zh: '上传图片' },
    orPasteUrl: { en: 'Or paste image URL', zh: '或粘贴图片链接' },
    addUrl: { en: 'Add', zh: '添加' },
    save: { en: 'Save', zh: '保存' },
    cancel: { en: 'Cancel', zh: '取消' },
    preview: { en: 'Preview', zh: '预览' },
    basic: { en: 'Basic Info', zh: '基本信息' },
    details: { en: 'Details', zh: '详细信息' },
    mediaLinks: { en: 'Media & Links', zh: '媒体和链接' },
    saved: { en: 'Item saved!', zh: '物品已保存！' },
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
  const [purchaseLink, setPurchaseLink] = useState('')
  const [availableFrom, setAvailableFrom] = useState('')
  const [availableUntil, setAvailableUntil] = useState('')
  const [allowViewing, setAllowViewing] = useState(true)
  const [priority, setPriority] = useState(3)
  const [tags, setTags] = useState('')
  const [notesEn, setNotesEn] = useState('')
  const [notesZh, setNotesZh] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setTitleEn(item.title.en)
      setTitleZh(item.title.zh)
      setCategory(item.category)
      setCondition(item.condition)
      setStatus(item.status)
      setOriginalPrice(item.original_price.toString())
      setAskingPrice(item.asking_price.toString())
      setDescriptionEn(item.description.en)
      setDescriptionZh(item.description.zh)
      setPurchaseLink(item.purchase_link || '')
      setAvailableFrom(item.available_from || '')
      setAvailableUntil(item.available_until || '')
      setAllowViewing(item.allow_viewing)
      setPriority(item.sell_priority)
      setTags(item.tags?.join(', ') || '')
      setNotesEn(item.notes?.en || '')
      setNotesZh(item.notes?.zh || '')
      setImages(item.images || [])
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
      setPurchaseLink('')
      setAvailableFrom('')
      setAvailableUntil('')
      setAllowViewing(true)
      setPriority(3)
      setTags('')
      setNotesEn('')
      setNotesZh('')
      setImages([])
    }
  }, [item, isOpen])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setImages(prev => [...prev, imageUrl.trim()])
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const itemData: Item = {
      id: item?.id || `item-${Date.now()}`,
      title: { en: titleEn, zh: titleZh },
      category,
      condition,
      status,
      original_price: parseFloat(originalPrice) || 0,
      asking_price: parseFloat(askingPrice) || 0,
      description: { en: descriptionEn, zh: descriptionZh },
      purchase_link: purchaseLink || undefined,
      available_from: availableFrom || undefined,
      available_until: availableUntil || undefined,
      allow_viewing: allowViewing,
      sell_priority: priority,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: (notesEn || notesZh) ? { en: notesEn, zh: notesZh } : undefined,
      images,
    }

    if (isEditing) {
      updateItem(item.id, itemData)
    } else {
      addItem(itemData)
    }

    toast.success(t(labels.saved))
    onClose()
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
              <TabsTrigger value="media">{t(labels.mediaLinks)}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              {/* Title fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(labels.titleEn)}</Label>
                  <Input
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="IKEA MALM Bed Frame"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.titleZh)}</Label>
                  <Input
                    value={titleZh}
                    onChange={(e) => setTitleZh(e.target.value)}
                    placeholder="宜家MALM床架"
                    required
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
                  <Label>{t(labels.originalPrice)} ({data.meta.currency})</Label>
                  <Input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="299"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.askingPrice)} ({data.meta.currency})</Label>
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

              {/* Priority slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t(labels.priority)}</Label>
                  <Badge variant={priority <= 2 ? 'destructive' : priority === 3 ? 'outline' : 'secondary'}>
                    {t(PRIORITY_LABELS[priority])}
                  </Badge>
                </div>
                <Slider
                  value={[priority]}
                  onValueChange={([v]) => setPriority(v)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t(PRIORITY_LABELS[1])}</span>
                  <span>{t(PRIORITY_LABELS[5])}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Descriptions */}
              <div className="space-y-2">
                <Label>{t(labels.descriptionEn)}</Label>
                <Textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Describe the item in English..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t(labels.descriptionZh)}</Label>
                <Textarea
                  value={descriptionZh}
                  onChange={(e) => setDescriptionZh(e.target.value)}
                  placeholder="用中文描述物品..."
                  rows={3}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(labels.availableFrom)}</Label>
                  <Input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.availableUntil)}</Label>
                  <Input
                    type="date"
                    value={availableUntil}
                    onChange={(e) => setAvailableUntil(e.target.value)}
                  />
                </div>
              </div>

              {/* Allow viewing */}
              <div className="flex items-center gap-3">
                <Switch
                  id="allow-viewing"
                  checked={allowViewing}
                  onCheckedChange={setAllowViewing}
                />
                <Label htmlFor="allow-viewing">{t(labels.allowViewing)}</Label>
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

              {/* Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(labels.notesEn)}</Label>
                  <Textarea
                    value={notesEn}
                    onChange={(e) => setNotesEn(e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(labels.notesZh)}</Label>
                  <Textarea
                    value={notesZh}
                    onChange={(e) => setNotesZh(e.target.value)}
                    placeholder="额外备注..."
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 pt-4">
              {/* Images */}
              <div className="space-y-2">
                <Label>{t(labels.images)}</Label>
                
                {/* Image previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t(labels.uploadImages)}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL input */}
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder={t(labels.orPasteUrl)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrl.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t(labels.addUrl)}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Purchase link */}
              <div className="space-y-2">
                <Label>{t(labels.purchaseLink)}</Label>
                <Input
                  type="url"
                  value={purchaseLink}
                  onChange={(e) => setPurchaseLink(e.target.value)}
                  placeholder="https://www.ikea.com/..."
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t(labels.cancel)}
            </Button>
            <Button type="submit">
              {t(labels.save)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
