export type Language = 'en' | 'zh'

export type Category = 'furniture' | 'electronics' | 'clothing' | 'kitchen' | 'sports' | 'books' | 'other'

export type Condition = 'like-new' | 'good' | 'fair' | 'well-loved'

export type ItemStatus = 'available' | 'reserved' | 'sold'

export type ContactPlatform = 'wechat' | 'xiaohongshu' | 'phone' | 'facebook' | 'discord' | 'qq' | 'custom'

export interface BilingualText {
  en: string
  zh: string
}

export interface ContactMethod {
  id: string
  platform: ContactPlatform
  value: string
  link?: string
  label?: string
  qr_code_url?: string
  enabled: boolean
  sort_order: number
}

export interface Settings {
  id: string
  seller_name: string
  location: string | null
  moving_date: string | null
  admin_password: string
}

export interface Item {
  id: string
  title_zh: string
  title_en: string | null
  description_zh: string | null
  description_en: string | null
  category: Category
  condition: Condition
  images: string[]
  original_price: number | null
  asking_price: number
  status: ItemStatus
  bundle_id: string | null
  tags: string[]
  featured: boolean
  sort_order: number
  available_from: string | null
  available_until: string | null
  sell_priority: number
  allow_viewing: boolean
  purchase_link: string | null
  notes_zh: string | null
  notes_en: string | null
  created_at?: string
  updated_at?: string
}

export interface Bundle {
  id: string
  name_zh: string
  name_en: string | null
  description_zh: string | null
  description_en: string | null
  discount_percent: number
  enabled: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface AppData {
  settings: Settings
  contactMethods: ContactMethod[]
  items: Item[]
  bundles: Bundle[]
}

// Legacy compatibility types
export interface SellerMeta {
  seller_name: string
  location: string
  contact: string
  moving_date: string
  currency: string
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

export const CONTACT_PLATFORM_INFO: Record<ContactPlatform, { label: BilingualText; icon: string; urlPrefix?: string; copyable?: boolean }> = {
  wechat: { 
    label: { en: 'WeChat', zh: '微信' }, 
    icon: 'MessageCircle',
    copyable: true
  },
  xiaohongshu: { 
    label: { en: 'Xiaohongshu', zh: '小红书' }, 
    icon: 'BookOpen',
    urlPrefix: 'https://www.xiaohongshu.com/user/profile/'
  },
  phone: { 
    label: { en: 'Phone/SMS', zh: '电话/短信' }, 
    icon: 'Phone',
    urlPrefix: 'tel:'
  },
  facebook: { 
    label: { en: 'Facebook', zh: 'Facebook' }, 
    icon: 'Facebook',
    urlPrefix: 'https://facebook.com/'
  },
  discord: { 
    label: { en: 'Discord', zh: 'Discord' }, 
    icon: 'MessageSquare',
    urlPrefix: 'https://discord.gg/'
  },
  qq: { 
    label: { en: 'QQ', zh: 'QQ' }, 
    icon: 'MessageCircle',
    copyable: true
  },
  custom: {
    label: { en: 'Custom', zh: '自定义' },
    icon: 'Link'
  }
}

// Helper function to get bilingual text from item
export function getItemTitle(item: Item, lang: Language): string {
  return lang === 'zh' ? item.title_zh : (item.title_en || item.title_zh)
}

export function getItemDescription(item: Item, lang: Language): string {
  if (lang === 'zh') return item.description_zh || ''
  return item.description_en || item.description_zh || ''
}

export function getBundleName(bundle: Bundle, lang: Language): string {
  return lang === 'zh' ? bundle.name_zh : (bundle.name_en || bundle.name_zh)
}

export function getBundleDescription(bundle: Bundle, lang: Language): string {
  if (lang === 'zh') return bundle.description_zh || ''
  return bundle.description_en || bundle.description_zh || ''
}
