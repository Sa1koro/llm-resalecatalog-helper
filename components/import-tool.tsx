'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'

type ImportMode = 'replace' | 'add' | 'update'

export function ImportTool() {
  const { addItem, updateItem, deleteItem, data, lang, refreshData } = useApp()
  const language = lang || 'zh'
  const [jsonInput, setJsonInput] = useState('')
  const [importMode, setImportMode] = useState<ImportMode>('add')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)

  const texts = {
    en: {
      importData: 'Import Data',
      pasteJSON: 'Paste JSON',
      uploadFile: 'Upload File',
      importMode: 'Import Mode',
      replaceAll: 'Replace All - Delete existing items and import new ones',
      addOnly: 'Add Only - Import only new items (skip duplicates)',
      updateById: 'Update by ID - Update items with matching ID',
      validate: 'Validate',
      import: 'Import',
      importing: 'Importing...',
      validating: 'Validating...',
      validated: 'Validated - Found {count} items',
      errors: 'Validation Errors',
      noJSON: 'Please enter or upload JSON data',
      invalidJSON: 'Invalid JSON format',
      success: 'Import successful!',
      failed: 'Import failed',
      preview: 'Preview',
      noItems: 'No items found in JSON',
    },
    zh: {
      importData: '导入数据',
      pasteJSON: '粘贴JSON',
      uploadFile: '上传文件',
      importMode: '导入模式',
      replaceAll: '全部替换 - 删除现有物品并导入新物品',
      addOnly: '仅添加 - 仅导入新物品（跳过重复项）',
      updateById: '按ID更新 - 更新匹配ID的物品',
      validate: '验证',
      import: '导入',
      importing: '导入中...',
      validating: '验证中...',
      validated: '验证成功 - 找到 {count} 件物品',
      errors: '验证错误',
      noJSON: '请输入或上传JSON数据',
      invalidJSON: '无效的JSON格式',
      success: '导入成功！',
      failed: '导入失败',
      preview: '预览',
      noItems: '在JSON中未找到物品',
    }
  }

  const t = texts[language]

  // 规范化数据 - 支持多种JSON格式
  const normalizeData = (data: any): any[] => {
    // 如果是直接的items数组
    if (Array.isArray(data)) {
      return data
    }

    // 如果是包含items字段的对象
    if (data.items && Array.isArray(data.items)) {
      return data.items
    }

    // 如果是包含goods字段的对象
    if (data.goods && Array.isArray(data.goods)) {
      return data.goods
    }

    // 如果是包含products字段的对象
    if (data.products && Array.isArray(data.products)) {
      return data.products
    }

    return []
  }

  // 验证和转换单个物品
  const validateItem = (item: any, index: number): { valid: boolean; item?: any; error?: string } => {
    try {
      // 基础字段检查
      const title = item.title_zh || item.title || item.name_zh || item.name || ''
      const askingPrice = parseFloat(item.asking_price || item.price || item.cost || 0)

      if (!title) {
        return { valid: false, error: `物品${index + 1}: 缺少标题` }
      }

      if (askingPrice <= 0) {
        return { valid: false, error: `物品${index + 1}: 价格必须大于0` }
      }

      return {
        valid: true,
        item: {
          title_zh: title,
          title_en: item.title_en || null,
          description_zh: item.description_zh || item.description || null,
          description_en: item.description_en || null,
          category: item.category || 'other',
          condition: item.condition || 'good',
          asking_price: askingPrice,
          original_price: item.original_price ? parseFloat(item.original_price) : null,
          status: item.status || 'available',
          images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
          tags: Array.isArray(item.tags) ? item.tags : [],
          bundle_id: item.bundle_id || null,
          featured: item.featured || false,
          available_from: item.available_from || null,
          available_until: item.available_until || null,
          sell_priority: item.sell_priority || 5,
          allow_viewing: item.allow_viewing !== false,
          purchase_link: item.purchase_link || null,
          notes_zh: item.notes_zh || item.notes || null,
          notes_en: item.notes_en || null,
          id: item.id || null, // 可能没有ID
        },
      }
    } catch (error) {
      return { valid: false, error: `物品${index + 1}: 格式错误 - ${(error as Error).message}` }
    }
  }

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      toast.error(t.noJSON)
      return
    }

    try {
      const data = JSON.parse(jsonInput)
      const items = normalizeData(data)

      if (items.length === 0) {
        toast.error(t.noItems)
        return
      }

      const validatedItems = []
      const errors = []

      items.forEach((item, index) => {
        const result = validateItem(item, index)
        if (result.valid && result.item) {
          validatedItems.push(result.item)
        } else if (result.error) {
          errors.push(result.error)
        }
      })

      setValidationResult({
        total: items.length,
        valid: validatedItems.length,
        errors,
        items: validatedItems,
      })

      if (errors.length === 0) {
        toast.success(t.validated.replace('{count}', validatedItems.length.toString()))
      } else {
        toast.error(`${validatedItems.length}/${items.length} ${language === 'zh' ? '有效' : 'valid'}`)
      }
    } catch (error) {
      toast.error(t.invalidJSON)
      setValidationResult(null)
    }
  }

  const handleImport = async () => {
    if (!validationResult) {
      toast.error(language === 'zh' ? '请先验证数据' : 'Please validate data first')
      return
    }

    setIsImporting(true)
    try {
      const items = validationResult.items
      
      if (importMode === 'replace') {
        // Delete all existing items first
        for (const existingItem of data.items) {
          await deleteItem(existingItem.id)
        }
      }

      for (const item of items) {
        if (importMode === 'update' && item.id) {
          // Try to find existing item by id
          const existing = data.items.find(i => i.id === item.id)
          if (existing) {
            const { id, ...updates } = item
            await updateItem(id, updates)
          } else {
            const { id, ...newItem } = item
            await addItem(newItem)
          }
        } else {
          // Add as new item (remove id if present)
          const { id, ...newItem } = item
          await addItem(newItem)
        }
      }
      
      await refreshData()
      toast.success(t.success)
      setJsonInput('')
      setValidationResult(null)
    } catch (error) {
      toast.error(t.failed)
      console.error(error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setJsonInput(content)
      } catch (error) {
        toast.error(language === 'zh' ? '读取文件失败' : 'Failed to read file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">{t.pasteJSON}</TabsTrigger>
          <TabsTrigger value="upload">{t.uploadFile}</TabsTrigger>
        </TabsList>

        {/* Paste JSON Tab */}
        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.importData}</CardTitle>
              <CardDescription>{language === 'zh' ? '粘贴您从AI生成或导出的JSON数据' : 'Paste JSON data from AI generation or export'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{
  "items": [
    {
      "title_zh": "沙发",
      "asking_price": 200,
      "category": "furniture",
      "condition": "good"
    }
  ]
}`}
                className="font-mono text-sm min-h-40"
              />

              <Button onClick={handleValidate} className="w-full">
                {t.validate}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload File Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.uploadFile}</CardTitle>
              <CardDescription>{language === 'zh' ? '选择一个JSON文件来上传' : 'Select a JSON file to upload'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <Label htmlFor="file-input" className="cursor-pointer">
                  <p className="text-sm font-medium">{language === 'zh' ? '点击选择文件或拖拽上传' : 'Click to select or drag & drop'}</p>
                </Label>
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {jsonInput && (
                <Button onClick={handleValidate} className="w-full">
                  {t.validate}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.errors.length === 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {language === 'zh' ? '验证成功' : 'Validation Passed'}
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  {language === 'zh' ? '部分数据有问题' : 'Some data has issues'}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p>{language === 'zh' ? '总计' : 'Total'}: {validationResult.total}</p>
              <p className="text-green-600">{language === 'zh' ? '有效' : 'Valid'}: {validationResult.valid}</p>
              {validationResult.errors.length > 0 && (
                <p className="text-orange-600">{language === 'zh' ? '错误' : 'Errors'}: {validationResult.errors.length}</p>
              )}
            </div>

            {validationResult.errors.length > 0 && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {validationResult.errors.slice(0, 5).map((error: string, i: number) => (
                      <li key={i}>{error}</li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li>... {language === 'zh' ? '还有' : 'and'} {validationResult.errors.length - 5} {language === 'zh' ? '个错误' : 'more errors'}</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.valid > 0 && (
              <>
                {/* Import Mode Selection */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="font-semibold">{t.importMode}</Label>
                  <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="add" id="add" />
                      <Label htmlFor="add" className="font-normal cursor-pointer text-sm">
                        <div>{language === 'zh' ? '仅添加' : 'Add Only'}</div>
                        <div className="text-xs text-gray-500">{t.addOnly}</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="update" id="update" />
                      <Label htmlFor="update" className="font-normal cursor-pointer text-sm">
                        <div>{language === 'zh' ? '按ID更新' : 'Update by ID'}</div>
                        <div className="text-xs text-gray-500">{t.updateById}</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace" className="font-normal cursor-pointer text-sm">
                        <div>{language === 'zh' ? '全部替换' : 'Replace All'}</div>
                        <div className="text-xs text-gray-500">{t.replaceAll}</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Preview */}
                <div className="border-t pt-4 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
                  <p className="font-semibold mb-2">{t.preview}:</p>
                  {validationResult.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="mb-2 pb-2 border-b last:border-b-0">
                      <p className="truncate">
                        {item.title_zh} - ¥{item.asking_price} ({item.condition})
                      </p>
                    </div>
                  ))}
                  {validationResult.items.length > 3 && (
                    <p className="text-gray-500">... {language === 'zh' ? '共' : 'Total'} {validationResult.items.length} {language === 'zh' ? '件' : 'items'}</p>
                  )}
                </div>

                {/* Import Button */}
                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? t.importing : t.import}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
