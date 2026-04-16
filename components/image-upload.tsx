'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ images, onChange, maxImages = 5, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (images.length >= maxImages) return

    setUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          newImages.push(data.url)
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages])
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (index: number) => {
    const urlToRemove = images[index]
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)

    // Try to delete from blob storage
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToRemove }),
      })
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  封面
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
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          {uploading ? (
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
            disabled={disabled || uploading}
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
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const input = e.target as HTMLInputElement
              const url = input.value.trim()
              if (url && images.length < maxImages) {
                onChange([...images, url])
                input.value = ''
              }
            }
          }}
          disabled={disabled || images.length >= maxImages}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || images.length >= maxImages}
          onClick={(e) => {
            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
            const url = input.value.trim()
            if (url && images.length < maxImages) {
              onChange([...images, url])
              input.value = ''
            }
          }}
        >
          添加
        </Button>
      </div>
    </div>
  )
}
