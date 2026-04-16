'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Percent,
  Tag,
  Image as ImageIcon
} from 'lucide-react'
import { getBundleName, getItemTitle, type Bundle } from '@/lib/types'
import { toast } from 'sonner'

interface BundleFormData {
  name_zh: string
  name_en: string
  description_zh: string
  description_en: string
  discount_percent: number
  enabled: boolean
}

const DEFAULT_FORM: BundleFormData = {
  name_zh: '',
  name_en: '',
  description_zh: '',
  description_en: '',
  discount_percent: 10,
  enabled: true,
}

export function BundleManager() {
  const { data, lang, addBundle, updateBundle, deleteBundle, updateItem, getItemsInBundle, calculateBundlePrice, calculateBundleSavings } = useApp()
  const { bundles, items } = data

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [formData, setFormData] = useState<BundleFormData>(DEFAULT_FORM)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const openAddDialog = () => {
    setEditingBundle(null)
    setFormData(DEFAULT_FORM)
    setSelectedItems([])
    setDialogOpen(true)
  }

  const openEditDialog = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setFormData({
      name_zh: bundle.name_zh,
      name_en: bundle.name_en || '',
      description_zh: bundle.description_zh || '',
      description_en: bundle.description_en || '',
      discount_percent: bundle.discount_percent,
      enabled: bundle.enabled,
    })
    setSelectedItems(items.filter(i => i.bundle_id === bundle.id).map(i => i.id))
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name_zh.trim()) {
      toast.error(lang === 'zh' ? '请输入套装名称' : 'Please enter bundle name')
      return
    }

    setSaving(true)
    try {
      if (editingBundle) {
        // Update bundle
        await updateBundle(editingBundle.id, {
          name_zh: formData.name_zh,
          name_en: formData.name_en || null,
          description_zh: formData.description_zh || null,
          description_en: formData.description_en || null,
          discount_percent: formData.discount_percent,
          enabled: formData.enabled,
        })

        // Update item associations
        const currentItems = items.filter(i => i.bundle_id === editingBundle.id)
        
        // Remove items no longer in bundle
        for (const item of currentItems) {
          if (!selectedItems.includes(item.id)) {
            await updateItem(item.id, { bundle_id: null })
          }
        }
        
        // Add new items to bundle
        for (const itemId of selectedItems) {
          const item = items.find(i => i.id === itemId)
          if (item && item.bundle_id !== editingBundle.id) {
            await updateItem(itemId, { bundle_id: editingBundle.id })
          }
        }

        toast.success(lang === 'zh' ? '套装已更新' : 'Bundle updated')
      } else {
        // Create new bundle
        const newBundle = await addBundle({
          name_zh: formData.name_zh,
          name_en: formData.name_en || null,
          description_zh: formData.description_zh || null,
          description_en: formData.description_en || null,
          discount_percent: formData.discount_percent,
          enabled: formData.enabled,
          sort_order: bundles.length,
        })

        // Associate items with new bundle
        for (const itemId of selectedItems) {
          await updateItem(itemId, { bundle_id: newBundle.id })
        }

        toast.success(lang === 'zh' ? '套装已创建' : 'Bundle created')
      }

      setDialogOpen(false)
    } catch (error) {
      toast.error(lang === 'zh' ? '操作失败' : 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bundleId: string) => {
    try {
      await deleteBundle(bundleId)
      toast.success(lang === 'zh' ? '套装已删除' : 'Bundle deleted')
    } catch (error) {
      toast.error(lang === 'zh' ? '删除失败' : 'Delete failed')
    }
  }

  const toggleEnabled = async (bundle: Bundle) => {
    await updateBundle(bundle.id, { enabled: !bundle.enabled })
  }

  const availableItems = items.filter(item => 
    item.status === 'available' && 
    (!item.bundle_id || item.bundle_id === editingBundle?.id)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {lang === 'zh' ? '套装管理' : 'Bundle Management'}
              </CardTitle>
              <CardDescription>
                {lang === 'zh' ? '创建和管理打包优惠套装' : 'Create and manage bundle deals'}
              </CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="mr-1 h-4 w-4" />
              {lang === 'zh' ? '新建套装' : 'New Bundle'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bundles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>{lang === 'zh' ? '暂无套装，点击上方按钮创建' : 'No bundles yet, click button above to create'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bundles.map((bundle) => {
                const bundleItems = getItemsInBundle(bundle.id)
                const bundlePrice = calculateBundlePrice(bundle)
                const savings = calculateBundleSavings(bundle)

                return (
                  <div
                    key={bundle.id}
                    className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center"
                  >
                    {/* Bundle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                          {getBundleName(bundle, lang)}
                        </h3>
                        {!bundle.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            {lang === 'zh' ? '已禁用' : 'Disabled'}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Items in bundle */}
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {bundleItems.slice(0, 3).map(item => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {getItemTitle(item, lang)}
                          </Badge>
                        ))}
                        {bundleItems.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{bundleItems.length - 3}
                          </Badge>
                        )}
                        {bundleItems.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            {lang === 'zh' ? '无物品' : 'No items'}
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-primary">
                          <Percent className="h-3 w-3" />
                          {bundle.discount_percent}% {lang === 'zh' ? '折扣' : 'off'}
                        </span>
                        {bundleItems.length > 0 && (
                          <>
                            <span className="text-muted-foreground">|</span>
                            <span className="font-medium">
                              ¥{bundlePrice.toFixed(0)}
                            </span>
                            <span className="text-green-600">
                              {lang === 'zh' ? `省 ¥${savings.toFixed(0)}` : `Save ¥${savings.toFixed(0)}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={bundle.enabled}
                        onCheckedChange={() => toggleEnabled(bundle)}
                      />
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(bundle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {lang === 'zh' ? '删除套装' : 'Delete Bundle'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {lang === 'zh' 
                                ? '确定要删除这个套装吗？套装内的物品不会被删除。' 
                                : 'Are you sure you want to delete this bundle? Items in the bundle will not be deleted.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {lang === 'zh' ? '取消' : 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(bundle.id)}>
                              {lang === 'zh' ? '删除' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBundle 
                ? (lang === 'zh' ? '编辑套装' : 'Edit Bundle')
                : (lang === 'zh' ? '新建套装' : 'New Bundle')
              }
            </DialogTitle>
            <DialogDescription>
              {lang === 'zh' 
                ? '设置套装信息和包含的物品' 
                : 'Set bundle info and included items'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{lang === 'zh' ? '套装名称 (中文) *' : 'Bundle Name (Chinese) *'}</Label>
                <Input
                  value={formData.name_zh}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_zh: e.target.value }))}
                  placeholder={lang === 'zh' ? '如：客厅家具套装' : 'e.g., Living Room Set'}
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'zh' ? '套装名称 (英文)' : 'Bundle Name (English)'}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Living Room Furniture Set"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{lang === 'zh' ? '描述 (中文)' : 'Description (Chinese)'}</Label>
                <Textarea
                  value={formData.description_zh}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_zh: e.target.value }))}
                  rows={2}
                  placeholder={lang === 'zh' ? '套装描述...' : 'Bundle description...'}
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'zh' ? '描述 (英文)' : 'Description (English)'}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  rows={2}
                  placeholder="Bundle description..."
                />
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                {lang === 'zh' ? '折扣百分比' : 'Discount Percentage'}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            {/* Item Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {lang === 'zh' ? '包含物品' : 'Included Items'}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {lang === 'zh' 
                  ? '选择要包含在套装中的物品（仅显示可售物品）' 
                  : 'Select items to include in this bundle (showing available items only)'}
              </p>
              
              {availableItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {lang === 'zh' ? '没有可用的物品' : 'No available items'}
                </p>
              ) : (
                <div className="grid gap-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                  {availableItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems(prev => [...prev, item.id])
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== item.id))
                          }
                        }}
                      />
                      {item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {getItemTitle(item, lang)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ¥{item.asking_price}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {selectedItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {lang === 'zh' 
                    ? `已选 ${selectedItems.length} 件物品` 
                    : `${selectedItems.length} item(s) selected`}
                </p>
              )}
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <Label>{lang === 'zh' ? '启用套装' : 'Enable Bundle'}</Label>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {lang === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving 
                ? (lang === 'zh' ? '保存中...' : 'Saving...') 
                : (lang === 'zh' ? '保存' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
