'use client'

import { useState } from 'react'
import confetti from 'canvas-confetti'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  FileText, 
  ChevronUp, 
  ChevronDown,
  Package
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
  PRIORITY_LABELS,
  type Item,
  type ItemStatus
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface AdminItemListProps {
  viewMode: 'grid' | 'list'
  onEdit: (item: Item) => void
  onGeneratePost: (item: Item) => void
}

export function AdminItemList({ viewMode, onEdit, onGeneratePost }: AdminItemListProps) {
  const { data, t, deleteItem, duplicateItem, updateItemStatus, reorderItems } = useApp()
  const [deleteConfirm, setDeleteConfirm] = useState<Item | null>(null)

  const labels = {
    image: { en: 'Image', zh: '图片' },
    title: { en: 'Title', zh: '标题' },
    category: { en: 'Category', zh: '分类' },
    condition: { en: 'Condition', zh: '成色' },
    price: { en: 'Price', zh: '价格' },
    status: { en: 'Status', zh: '状态' },
    priority: { en: 'Priority', zh: '优先级' },
    actions: { en: 'Actions', zh: '操作' },
    edit: { en: 'Edit', zh: '编辑' },
    duplicate: { en: 'Duplicate', zh: '复制' },
    generatePost: { en: 'Generate Post', zh: '生成帖子' },
    delete: { en: 'Delete', zh: '删除' },
    deleteConfirmTitle: { en: 'Delete Item', zh: '删除物品' },
    deleteConfirmDescription: { en: 'Are you sure you want to delete this item? This action cannot be undone.', zh: '确定要删除此物品吗？此操作无法撤销。' },
    cancel: { en: 'Cancel', zh: '取消' },
    confirm: { en: 'Delete', zh: '删除' },
    noItems: { en: 'No items yet', zh: '暂无物品' },
    addFirst: { en: 'Add your first item to get started!', zh: '添加第一个物品开始吧！' },
  }

  const cycleStatus = (item: Item) => {
    const statusOrder: ItemStatus[] = ['available', 'reserved', 'sold']
    const currentIndex = statusOrder.indexOf(item.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    
    updateItemStatus(item.id, nextStatus)
    
    // Confetti on sold
    if (nextStatus === 'sold') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })
    }
  }

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case 'available': return 'default'
      case 'reserved': return 'outline'
      case 'sold': return 'secondary'
    }
  }

  const getPriorityBadge = (priority: number) => {
    if (priority <= 2) {
      return <Badge variant="destructive" className="bg-primary">{t(PRIORITY_LABELS[priority])}</Badge>
    }
    if (priority === 3) {
      return <Badge variant="outline" className="bg-secondary/20">{t(PRIORITY_LABELS[priority])}</Badge>
    }
    return <Badge variant="secondary">{t(PRIORITY_LABELS[priority])}</Badge>
  }

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteItem(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderItems(index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < data.items.length - 1) {
      reorderItems(index, index + 1)
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={t(item.title)}
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
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium line-clamp-1 mb-1">{t(item.title)}</h4>
                <p className="text-lg font-bold text-primary mb-2">${item.asking_price}</p>
                <div className="flex items-center justify-between">
                  {getPriorityBadge(item.sell_priority)}
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
                </div>
              </CardContent>
            </Card>
          ))}
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
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t(labels.image)}</TableHead>
              <TableHead>{t(labels.title)}</TableHead>
              <TableHead className="hidden md:table-cell">{t(labels.category)}</TableHead>
              <TableHead className="hidden lg:table-cell">{t(labels.condition)}</TableHead>
              <TableHead>{t(labels.price)}</TableHead>
              <TableHead>{t(labels.status)}</TableHead>
              <TableHead className="hidden sm:table-cell">{t(labels.priority)}</TableHead>
              <TableHead className="w-24">{t(labels.actions)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="w-12 h-12 rounded-md bg-muted overflow-hidden">
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={t(item.title)}
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
                  {t(item.title)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {CATEGORY_ICONS[item.category]} {t(CATEGORY_LABELS[item.category])}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">{t(CONDITION_LABELS[item.condition])}</Badge>
                </TableCell>
                <TableCell className="font-bold text-primary">
                  ${item.asking_price}
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
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1">
                    {getPriorityBadge(item.sell_priority)}
                    <div className="flex flex-col ml-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === data.items.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
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
            ))}
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
