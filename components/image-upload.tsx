'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  onUpload?: (url: string) => Promise<void> | void
  isLoading?: boolean
  images?: string[]
  onChange?: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  onUpload,
  isLoading: externalLoading = false,
  images = [],
  onChange,
  maxImages = 5,
  disabled
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (images.length >= maxImages) {
      toast.error('已达到最大图片数量')
      return
    }

    setUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} 不是图片文件`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} 超过10MB限制`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            toast.error(`上传失败: ${error.error || response.statusText}`)
            continue
          }

          const data = await response.json()
          if (data.url) {
            newImages.push(data.url)
            if (onUpload) {
              await onUpload(data.url)
            }
          }
        } catch (error) {
          console.error('[v0] Upload error:', error)
          toast.error(`上传 ${file.name} 失败`)
        }
      }

      if (newImages.length > 0 && onChange) {
        onChange([...images, ...newImages])
      }

      if (newImages.length > 0) {
        toast.success(`成功上传 ${newImages.length} 张图片`)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = async (index: number) => {
    const urlToRemove = images[index]
    const newImages = images.filter((_, i) => i !== index)
    if (onChange) {
      onChange(newImages)
    }

    // Try to delete from blob storage
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToRemove }),
      })
    } catch (error) {
      console.error('[v0] Failed to delete image:', error)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const handleAddUrl = async () => {
    if (!urlInputValue.trim()) return
    if (images.length >= maxImages) {
      toast.error('已达到最大图片数量')
      return
    }

    try {
      // Validate URL
      new URL(urlInputValue)
      if (onChange) {
        onChange([...images, urlInputValue])
      }
      if (onUpload) {
        await onUpload(urlInputValue)
      }
      setUrlInputValue('')
      toast.success('图片链接已添加')
    } catch {
      toast.error('请输入有效的URL')
    }
  }

  const isLoading = uploading || externalLoading

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || isLoading}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  主图
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
            (disabled || isLoading) && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && !isLoading && inputRef.current?.click()}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">上传中...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium">点击或拖拽上传图片</span>
                <p className="text-xs text-muted-foreground">
                  最多 {maxImages} 张，每张不超过 10MB
                </p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={disabled || isLoading}
          />
        </div>
      )}

      {/* URL Input Alternative */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">或输入图片URL</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={urlInputValue}
          onChange={(e) => setUrlInputValue(e.target.value)}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddUrl()
            }
          }}
          disabled={disabled || isLoading || images.length >= maxImages}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isLoading || images.length >= maxImages || !urlInputValue.trim()}
          onClick={handleAddUrl}
        >
          添加
        </Button>
      </div>
    </div>
  )
}
