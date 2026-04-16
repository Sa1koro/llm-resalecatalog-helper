'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Upload, FileJson, Check, AlertCircle, FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/app-context'
import { toast } from 'sonner'
import type { AppData, Item } from '@/lib/types'
import { CATEGORY_ICONS } from '@/lib/types'

type ImportMode = 'replace' | 'merge-new' | 'merge-update'

interface ValidationResult {
  valid: boolean
  data?: AppData
  error?: string
  lineHint?: number
}

export function ImportTool() {
  const { setRoute, setData, data: currentData, t, lang } = useApp()
  
  const [jsonInput, setJsonInput] = useState('')
  const [importMode, setImportMode] = useState<ImportMode>('replace')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const labels = {
    title: { en: 'Import JSON Data', zh: '导入 JSON 数据' },
    subtitle: { en: 'Import item data from a JSON file or paste JSON directly', zh: '从 JSON 文件导入或直接粘贴 JSON 数据' },
    back: { en: 'Back to Admin', zh: '返回管理后台' },
    pasteJson: { en: 'Paste JSON', zh: '粘贴 JSON' },
    uploadFile: { en: 'Upload .json file', zh: '上传 .json 文件' },
    orDragDrop: { en: 'or drag and drop', zh: '或拖拽文件到此处' },
    validatePreview: { en: 'Validate & Preview', zh: '验证并预览' },
    importMode: { en: 'Import Mode', zh: '导入模式' },
    replaceAll: { en: 'Replace all', zh: '替换全部' },
    replaceDesc: { en: 'Clears existing data and imports new data', zh: '清除现有数据，导入新数据' },
    mergeNew: { en: 'Merge - add new items only', zh: '合并 - 仅添加新物品' },
    mergeNewDesc: { en: 'Keeps existing items, adds new items with different IDs', zh: '保留现有物品，添加不同 ID 的新物品' },
    mergeUpdate: { en: 'Merge - update existing items by ID', zh: '合并 - 按 ID 更新现有物品' },
    mergeUpdateDesc: { en: 'Updates existing items with matching IDs, adds new items', zh: '更新匹配 ID 的物品，添加新物品' },
    confirmImport: { en: 'Confirm Import', zh: '确认导入' },
    validJson: { en: 'Valid JSON', zh: 'JSON 格式正确' },
    invalidJson: { en: 'Invalid JSON', zh: 'JSON 格式错误' },
    previewItems: { en: 'Preview of items to import:', zh: '待导入物品预览：' },
    name: { en: 'Name', zh: '名称' },
    category: { en: 'Category', zh: '分类' },
    price: { en: 'Price', zh: '价格' },
    status: { en: 'Status', zh: '状态' },
    importSuccess: { en: 'Data imported successfully!', zh: '数据导入成功！' },
    fixHint: { en: 'Fix hint', zh: '修复建议' },
    noItems: { en: 'No items found in JSON', zh: 'JSON 中没有找到物品' },
  }

  const validateJson = useCallback((input: string): ValidationResult => {
    if (!input.trim()) {
      return { valid: false, error: 'Please paste or upload JSON data' }
    }

    try {
      const parsed = JSON.parse(input)
      
      // Check if it's an AppData structure
      if (parsed.items && Array.isArray(parsed.items)) {
        // Validate items have required fields
        for (let i = 0; i < parsed.items.length; i++) {
          const item = parsed.items[i]
          if (!item.id || !item.title) {
            return {
              valid: false,
              error: `Item at index ${i} is missing required fields (id, title)`,
              lineHint: i + 1
            }
          }
        }
        
        return { valid: true, data: parsed as AppData }
      }
      
      // Check if it's just an array of items
      if (Array.isArray(parsed)) {
        for (let i = 0; i < parsed.length; i++) {
          const item = parsed[i]
          if (!item.id || !item.title) {
            return {
              valid: false,
              error: `Item at index ${i} is missing required fields (id, title)`,
              lineHint: i + 1
            }
          }
        }
        
        return { 
          valid: true, 
          data: { 
            ...currentData,
            items: parsed as Item[]
          } 
        }
      }

      // Single item
      if (parsed.id && parsed.title) {
        return {
          valid: true,
          data: {
            ...currentData,
            items: [parsed as Item]
          }
        }
      }

      return { 
        valid: false, 
        error: 'JSON structure not recognized. Expected AppData with items array, an array of items, or a single item object.' 
      }
    } catch (e) {
      const error = e as SyntaxError
      const match = error.message.match(/position (\d+)/)
      const position = match ? parseInt(match[1]) : undefined
      
      let lineHint: number | undefined
      if (position !== undefined) {
        const lines = input.substring(0, position).split('\n')
        lineHint = lines.length
      }

      return {
        valid: false,
        error: `JSON syntax error: ${error.message}`,
        lineHint
      }
    }
  }, [currentData])

  const handleValidate = () => {
    const result = validateJson(jsonInput)
    setValidationResult(result)
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonInput(content)
      setValidationResult(null)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.name.endsWith('.json')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonInput(content)
      setValidationResult(null)
    }
    reader.readAsText(file)
  }, [])

  const handleImport = () => {
    if (!validationResult?.valid || !validationResult.data) return

    setIsImporting(true)
    
    setTimeout(() => {
      const newData = validationResult.data!

      switch (importMode) {
        case 'replace':
          setData(newData)
          break
          
        case 'merge-new': {
          const existingIds = new Set(currentData.items.map(i => i.id))
          const newItems = newData.items.filter(i => !existingIds.has(i.id))
          setData({
            ...currentData,
            items: [...currentData.items, ...newItems],
            bundles: [...currentData.bundles, ...(newData.bundles || []).filter(
              b => !currentData.bundles.some(cb => cb.id === b.id)
            )]
          })
          break
        }
          
        case 'merge-update': {
          const itemMap = new Map(currentData.items.map(i => [i.id, i]))
          newData.items.forEach(item => {
            itemMap.set(item.id, item)
          })
          
          const bundleMap = new Map(currentData.bundles.map(b => [b.id, b]))
          newData.bundles?.forEach(bundle => {
            bundleMap.set(bundle.id, bundle)
          })
          
          setData({
            meta: newData.meta || currentData.meta,
            items: Array.from(itemMap.values()),
            bundles: Array.from(bundleMap.values())
          })
          break
        }
      }

      setIsImporting(false)
      toast.success(t(labels.importSuccess))
      setRoute('admin')
    }, 500)
  }

  return (
    <div className="container px-4 py-8 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => setRoute('admin')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t(labels.back)}
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-2">
          {t(labels.title)}
        </h1>
        <p className="text-muted-foreground">
          {t(labels.subtitle)}
        </p>
      </div>

      {/* JSON Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {t(labels.pasteJson)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value)
              setValidationResult(null)
            }}
            placeholder='{"items": [...]}'
            rows={10}
            className="font-mono text-sm"
          />
          
          {/* File upload */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <span className="text-sm font-medium">{t(labels.uploadFile)}</span>
              <p className="text-xs text-muted-foreground">{t(labels.orDragDrop)}</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button 
            onClick={handleValidate}
            className="w-full rounded-full"
            disabled={!jsonInput.trim()}
          >
            {t(labels.validatePreview)}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationResult && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            {validationResult.valid ? (
              <>
                <Alert className="mb-4 border-secondary bg-secondary/10">
                  <Check className="h-4 w-4 text-secondary" />
                  <AlertTitle>{t(labels.validJson)}</AlertTitle>
                  <AlertDescription>
                    {validationResult.data?.items.length || 0} items found
                  </AlertDescription>
                </Alert>

                {/* Preview table */}
                {validationResult.data && validationResult.data.items.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">{t(labels.previewItems)}</p>
                    <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t(labels.name)}</TableHead>
                            <TableHead>{t(labels.category)}</TableHead>
                            <TableHead>{t(labels.price)}</TableHead>
                            <TableHead>{t(labels.status)}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validationResult.data.items.slice(0, 10).map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.title?.[lang] || item.title?.en || item.title?.zh || 'Untitled'}
                              </TableCell>
                              <TableCell>
                                {CATEGORY_ICONS[item.category] || '📦'} {item.category}
                              </TableCell>
                              <TableCell>${item.asking_price}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {validationResult.data.items.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ...and {validationResult.data.items.length - 10} more items
                      </p>
                    )}
                  </div>
                )}

                {/* Import mode */}
                <div className="space-y-3">
                  <Label>{t(labels.importMode)}</Label>
                  <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as ImportMode)}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="replace" id="replace" />
                      <div className="grid gap-1">
                        <Label htmlFor="replace" className="font-medium">{t(labels.replaceAll)}</Label>
                        <p className="text-xs text-muted-foreground">{t(labels.replaceDesc)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="merge-new" id="merge-new" />
                      <div className="grid gap-1">
                        <Label htmlFor="merge-new" className="font-medium">{t(labels.mergeNew)}</Label>
                        <p className="text-xs text-muted-foreground">{t(labels.mergeNewDesc)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="merge-update" id="merge-update" />
                      <div className="grid gap-1">
                        <Label htmlFor="merge-update" className="font-medium">{t(labels.mergeUpdate)}</Label>
                        <p className="text-xs text-muted-foreground">{t(labels.mergeUpdateDesc)}</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleImport}
                  className="w-full mt-6 rounded-full"
                  disabled={isImporting}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  {t(labels.confirmImport)}
                </Button>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t(labels.invalidJson)}</AlertTitle>
                <AlertDescription>
                  {validationResult.error}
                  {validationResult.lineHint && (
                    <p className="mt-1 text-xs">
                      {t(labels.fixHint)}: Check around line {validationResult.lineHint}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
