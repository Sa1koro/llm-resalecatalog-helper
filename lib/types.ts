export type Language = 'en' | 'zh'

export type Category = 'furniture' | 'electronics' | 'clothing' | 'kitchen' | 'sports' | 'books' | 'other'

export type Condition = 'like-new' | 'good' | 'fair' | 'well-loved'

export type ItemStatus = 'available' | 'reserved' | 'sold'

export interface BilingualText {
  en: string
  zh: string
}

export interface Item {
  id: string
  title: BilingualText
  category: Category
  condition: Condition
  images: string[]
  original_price: number
  asking_price: number
  description: BilingualText
  purchase_link?: string
  review_links?: string[]
  available_from?: string
  available_until?: string
  allow_viewing: boolean
  sell_priority: number // 1-5, where 1 is "sell first"
  status: ItemStatus
  bundle_ids?: string[]
  tags?: string[]
  notes?: BilingualText
}

export interface Bundle {
  id: string
  title: BilingualText
  item_ids: string[]
  bundle_price: number
  description?: BilingualText
}

export interface SellerMeta {
  seller_name: string
  location: string
  contact: string
  moving_date: string
  currency: string
}

export interface AppData {
  meta: SellerMeta
  items: Item[]
  bundles: Bundle[]
}

// UI Labels
export const CATEGORY_LABELS: Record<Category, BilingualText> = {
  furniture: { en: 'Furniture', zh: '家具' },
  electronics: { en: 'Electronics', zh: '电子产品' },
  clothing: { en: 'Clothing', zh: '服装' },
  kitchen: { en: 'Kitchen', zh: '厨房用品' },
  sports: { en: 'Sports', zh: '运动器材' },
  books: { en: 'Books', zh: '书籍' },
  other: { en: 'Other', zh: '其他' },
}

export const CATEGORY_ICONS: Record<Category, string> = {
  furniture: '🛋️',
  electronics: '📱',
  clothing: '👕',
  kitchen: '🍳',
  sports: '🚴',
  books: '📚',
  other: '📦',
}

export const CONDITION_LABELS: Record<Condition, BilingualText> = {
  'like-new': { en: 'Like New', zh: '几乎全新' },
  'good': { en: 'Good', zh: '良好' },
  'fair': { en: 'Fair', zh: '一般' },
  'well-loved': { en: 'Well Loved', zh: '有使用痕迹' },
}

export const STATUS_LABELS: Record<ItemStatus, BilingualText> = {
  available: { en: 'Available', zh: '可购买' },
  reserved: { en: 'Reserved', zh: '已预订' },
  sold: { en: 'Sold', zh: '已售出' },
}

export const PRIORITY_LABELS: Record<number, BilingualText> = {
  1: { en: 'Sell ASAP', zh: '急售' },
  2: { en: 'Sell Soon', zh: '尽快出' },
  3: { en: 'No Rush', zh: '不急' },
  4: { en: 'Later', zh: '稍后' },
  5: { en: 'Keep Until Moving', zh: '搬家前再卖' },
}
