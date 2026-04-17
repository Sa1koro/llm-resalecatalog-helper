'use client'

import { useState, useMemo } from 'react'
import confetti from 'canvas-confetti'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  FileText,
  Package,
  Star,
  Flame,
  Clock,
  GripVertical,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/lib/app-context'
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CONDITION_LABELS,
  STATUS_LABELS,
  getItemTitle,
  getPriorityLabel,
  getPriorityColor,
  formatPrice,
  type Item,
  type ItemStatus,
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface AdminItemListProps {
  viewMode: 'grid' | 'list'
  onEdit: (item: Item) => void
  onGeneratePost: (item: Item) => void
}

export function AdminItemList({ viewMode, onEdit, onGeneratePost }: AdminItemListProps) {
  const { data, t, lang, deleteItem, duplicateItem, updateItemStatus, updateItem, reorderItems } = useApp()
  const currency = data.settings.currency || 'CAD'
  const [deleteConfirm, setDeleteConfirm] = useState<Item | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const labels = {
    image: { en: 'Image', zh: '图片' },
    title: { en: 'Title', zh: '标题' },
    category: { en: 'Category', zh: '分类' },
    condition: { en: 'Condition', zh: '成色' },
    price: { en: 'Price', zh: '价格' },
    status: { en: 'Status', zh: '状态' },
    featured: { en: 'Featured', zh: '推荐' },
    priority: { en: 'Priority', zh: '优先级' },
    availability: { en: 'Available', zh: '可取货' },
    actions: { en: 'Actions', zh: '操作' },
    edit: { en: 'Edit', zh: '编辑' },
    duplicate: { en: 'Duplicate', zh: '复制' },
    generatePost: { en: 'Generate Post', zh: '生成帖子' },
    delete: { en: 'Delete', zh: '删除' },
    toggleFeatured: { en: 'Toggle Featured', zh: '切换推荐' },
    cyclePriority: { en: 'Cycle Priority', zh: '调整优先级' },
    deleteConfirmTitle: { en: 'Delete Item', zh: '删除物品' },
    deleteConfirmDescription: { en: 'Are you sure you want to delete this item? This action cannot be undone.', zh: '确定要删除此物品吗？此操作无法撤销。' },
    cancel: { en: 'Cancel', zh: '取消' },
    confirm: { en: 'Delete', zh: '删除' },
    noItems: { en: 'No items yet', zh: '暂无物品' },
    addFirst: { en: 'Add your first item to get started!', zh: '添加第一个物品开始吧！' },
    dragHint: { en: 'Drag rows to reorder. Order here = "Featured" order on the shop.', zh: '拖动行可自定义排序。此顺序即店铺"推荐"排序的顺序。' },
    availableNow: { en: 'Now', zh: '即日起' },
  }

  // Always show sorted by sort_order in admin list
  const items = useMemo(
    () => [...data.items].sort((a, b) => a.sort_order - b.sort_order),
    [data.items]
  )

  const cycleStatus = async (item: Item) => {
    const statusOrder: ItemStatus[] = ['available', 'reserved', 'sold']
    const currentIndex = statusOrder.indexOf(item.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]

    await updateItemStatus(item.id, nextStatus)

    if (nextStatus === 'sold') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })
    }
  }

  const toggleFeatured = async (item: Item) => {
    await updateItem(item.id, { featured: !item.featured })
  }

  // Cycle 1→2→…→10→1 on click. Hold shift to go backwards.
  const cyclePriority = async (item: Item, backwards = false) => {
    const current = item.sell_priority || 5
    const next = backwards
      ? (current <= 1 ? 10 : current - 1)
      : (current >= 10 ? 1 : current + 1)
    await updateItem(item.id, { sell_priority: next })
  }

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case 'available': return 'default'
      case 'reserved': return 'outline'
      case 'sold': return 'secondary'
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteItem(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const formatAvailableShort = (item: Item) => {
    const dateLocale = lang === 'zh' ? 'zh-CN' : 'en-US'
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    const from = item.available_from ? new Date(item.available_from).toLocaleDateString(dateLocale, opts) : t(labels.availableNow)
    const until = item.available_until ? new Date(item.available_until).toLocaleDateString(dateLocale, opts) : null
    if (!item.available_from && !item.available_until) return t(labels.availableNow)
    return until ? `${from} – ${until}` : from
  }

  // Drag-and-drop handlers -------------------------------------------------
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Firefox requires data to start the drag
    try { e.dataTransfer.setData('text/plain', id) } catch {}
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverId !== id) setDragOverId(id)
  }

  const handleDragLeave = (id: string) => {
    if (dragOverId === id) setDragOverId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = draggingId
    setDraggingId(null)
    setDragOverId(null)
    if (!sourceId || sourceId === targetId) return

    const currentIds = items.map(i => i.id)
    const fromIdx = currentIds.indexOf(sourceId)
    const toIdx = currentIds.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0) return

    const newIds = [...currentIds]
    newIds.splice(fromIdx, 1)
    newIds.splice(toIdx, 0, sourceId)
    await reorderItems(newIds)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          {t(labels.noItems)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(labels.addFirst)}
        </p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <>
        <p className="text-xs text-muted-foreground mb-3">{t(labels.dragHint)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const priority = item.sell_priority || 5
            const priorityLabel = getPriorityLabel(priority)
            const priorityColor = getPriorityColor(priority)
            return (
              <Card
                key={item.id}
                className={cn(
                  'overflow-hidden transition-opacity',
                  draggingId === item.id && 'opacity-40',
                  dragOverId === item.id && draggingId !== item.id && 'ring-2 ring-primary'
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={() => handleDragLeave(item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={getItemTitle(item, lang)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-50">
                        {CATEGORY_ICONS[item.category]}
                      </span>
                    </div>
                  )}
                  <Badge
                    variant={getStatusBadgeVariant(item.status)}
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={() => cycleStatus(item)}
                  >
                    {t(STATUS_LABELS[item.status])}
                  </Badge>
                  {item.featured && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {lang === 'zh' ? '推荐' : 'Featured'}
                    </Badge>
                  )}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-muted-foreground/70 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium line-clamp-1 mb-1">{getItemTitle(item, lang)}</h4>
                  <p className="text-lg font-bold text-primary mb-2">{formatPrice(item.asking_price, currency)}</p>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <Badge variant="outline">{t(CONDITION_LABELS[item.condition])}</Badge>
                    <Badge
                      onClick={(e) => cyclePriority(item, e.shiftKey)}
                      className={cn('cursor-pointer border select-none', priorityColor)}
                      title={t(labels.cyclePriority)}
                    >
                      <Flame className="h-3 w-3 mr-1" />
                      {priority} · {priorityLabel[lang]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{formatAvailableShort(item)}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t(labels.edit)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateItem(item.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t(labels.duplicate)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onGeneratePost(item)}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t(labels.generatePost)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFeatured(item)}>
                          <Star className="h-4 w-4 mr-2" />
                          {t(labels.toggleFeatured)}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t(labels.delete)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t(labels.deleteConfirmTitle)}</AlertDialogTitle>
              <AlertDialogDescription>
                {t(labels.deleteConfirmDescription)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t(labels.cancel)}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {t(labels.confirm)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <p className="text-xs text-muted-foreground mb-3">{t(labels.dragHint)}</p>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-16">{t(labels.image)}</TableHead>
              <TableHead>{t(labels.title)}</TableHead>
              <TableHead className="hidden md:table-cell">{t(labels.category)}</TableHead>
              <TableHead className="hidden lg:table-cell">{t(labels.condition)}</TableHead>
              <TableHead>{t(labels.price)}</TableHead>
              <TableHead>{t(labels.status)}</TableHead>
              <TableHead className="hidden md:table-cell">{t(labels.priority)}</TableHead>
              <TableHead className="hidden xl:table-cell">{t(labels.availability)}</TableHead>
              <TableHead className="hidden sm:table-cell">{t(labels.featured)}</TableHead>
              <TableHead className="w-24">{t(labels.actions)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const priority = item.sell_priority || 5
              const priorityLabel = getPriorityLabel(priority)
              const priorityColor = getPriorityColor(priority)
              return (
                <TableRow
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDragLeave={() => handleDragLeave(item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'transition-colors',
                    draggingId === item.id && 'opacity-40',
                    dragOverId === item.id && draggingId !== item.id && 'bg-primary/5'
                  )}
                >
                  <TableCell className="cursor-grab active:cursor-grabbing text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md bg-muted overflow-hidden">
                      {item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={getItemTitle(item, lang)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg">
                            {CATEGORY_ICONS[item.category]}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {getItemTitle(item, lang)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {CATEGORY_ICONS[item.category]} {t(CATEGORY_LABELS[item.category])}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{t(CONDITION_LABELS[item.condition])}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatPrice(item.asking_price, currency)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(item.status)}
                      className="cursor-pointer"
                      onClick={() => cycleStatus(item)}
                    >
                      {t(STATUS_LABELS[item.status])}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      onClick={(e) => cyclePriority(item, e.shiftKey)}
                      className={cn('cursor-pointer border select-none', priorityColor)}
                      title={t(labels.cyclePriority)}
                    >
                      <Flame className="h-3 w-3 mr-1" />
                      {priority} · {priorityLabel[lang]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {formatAvailableShort(item)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Button
                      variant={item.featured ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleFeatured(item)}
                    >
                      <Star className={`h-4 w-4 ${item.featured ? 'fill-current' : ''}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t(labels.edit)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateItem(item.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t(labels.duplicate)}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onGeneratePost(item)}>
                          <FileText className="h-4 w-4 mr-2" />
                          {t(labels.generatePost)}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(item)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t(labels.delete)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(labels.deleteConfirmTitle)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(labels.deleteConfirmDescription)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(labels.cancel)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t(labels.confirm)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
