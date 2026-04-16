import type { AppData } from './types'

export const sampleData: AppData = {
  meta: {
    seller_name: "Lily",
    location: "North York, Toronto",
    contact: "DM on Xiaohongshu / Facebook",
    moving_date: "2026-05-30",
    currency: "CAD"
  },
  items: [
    {
      id: "item-001",
      title: { en: "IKEA MALM Queen Bed Frame", zh: "宜家MALM双人床架" },
      category: "furniture",
      condition: "like-new",
      images: [],
      original_price: 299,
      asking_price: 120,
      description: {
        en: "Beautiful queen-size bed frame in white. Includes slats. Minimal use, no scratches or damage. Perfect for a new bedroom setup.",
        zh: "白色双人床架，含床板。使用很少，无划痕或损坏。非常适合新卧室布置。"
      },
      purchase_link: "https://www.ikea.com/ca/en/p/malm-bed-frame-high-white-s19931566/",
      available_from: "2026-05-01",
      available_until: "2026-05-30",
      allow_viewing: true,
      sell_priority: 5,
      status: "available",
      tags: ["bedroom", "ikea", "white"],
      notes: { en: "Disassembly help available", zh: "可协助拆卸" }
    },
    {
      id: "item-002",
      title: { en: "LG 27\" 4K Monitor", zh: "LG 27寸4K显示器" },
      category: "electronics",
      condition: "good",
      images: [],
      original_price: 549,
      asking_price: 280,
      description: {
        en: "LG 27UK650 4K UHD IPS monitor. Excellent color accuracy, HDR10 support. Has been my work-from-home monitor for 2 years. Minor desk clamp marks on stand.",
        zh: "LG 27UK650 4K超高清IPS显示器。色彩准确，支持HDR10。作为居家办公显示器使用2年。支架有轻微夹痕。"
      },
      purchase_link: "https://www.lg.com/ca_en/monitors/lg-27uk650-w",
      available_from: "2026-04-15",
      available_until: "2026-05-30",
      allow_viewing: false,
      sell_priority: 1,
      status: "available",
      tags: ["monitor", "4k", "work-from-home", "lg"]
    },
    {
      id: "item-003",
      title: { en: "Dyson V8 Vacuum", zh: "戴森V8吸尘器" },
      category: "electronics",
      condition: "good",
      images: [],
      original_price: 399,
      asking_price: 180,
      description: {
        en: "Dyson V8 Absolute cordless vacuum. Includes all original attachments. Battery still holds good charge (about 30 min runtime). Some cosmetic wear on body.",
        zh: "戴森V8 Absolute无线吸尘器。包含所有原装配件。电池仍可使用约30分钟。机身有些许使用痕迹。"
      },
      purchase_link: "https://www.dyson.ca/en/vacuum-cleaners/cordless/v8",
      available_from: "2026-04-20",
      available_until: "2026-05-30",
      allow_viewing: true,
      sell_priority: 2,
      status: "available",
      tags: ["vacuum", "dyson", "cordless", "cleaning"]
    },
    {
      id: "item-004",
      title: { en: "IKEA KALLAX Shelf 4x2", zh: "宜家KALLAX书架 4x2" },
      category: "furniture",
      condition: "fair",
      images: [],
      original_price: 159,
      asking_price: 60,
      description: {
        en: "IKEA KALLAX 4x2 shelf unit in white. Great for storage or room divider. Some minor scratches on top surface from use. Sturdy and functional.",
        zh: "宜家KALLAX 4x2白色书架。适合收纳或作为房间隔断。顶部有些使用痕迹。结实耐用。"
      },
      purchase_link: "https://www.ikea.com/ca/en/p/kallax-shelf-unit-white-20275814/",
      available_from: "2026-05-01",
      available_until: "2026-05-30",
      allow_viewing: true,
      sell_priority: 3,
      status: "available",
      bundle_ids: ["bundle-001"],
      tags: ["storage", "ikea", "shelf", "white"]
    },
    {
      id: "item-005",
      title: { en: "Trek FX3 Hybrid Bike", zh: "崔克FX3混合动力自行车" },
      category: "sports",
      condition: "like-new",
      images: [],
      original_price: 899,
      asking_price: 450,
      description: {
        en: "Trek FX3 Disc hybrid bike, size M. Carbon fork, Shimano drivetrain. Only ridden a handful of times - practically new. Perfect for commuting or fitness.",
        zh: "崔克FX3碟刹混合动力自行车，M码。碳纤维前叉，Shimano传动系统。仅骑过几次，几乎全新。非常适合通勤或健身。"
      },
      purchase_link: "https://www.trekbikes.com/ca/en_CA/bikes/hybrid-bikes/fitness-bikes/fx/fx-3-disc/",
      available_from: "2026-04-15",
      available_until: "2026-05-30",
      allow_viewing: true,
      sell_priority: 2,
      status: "available",
      tags: ["bike", "trek", "commuter", "fitness"]
    },
    {
      id: "item-006",
      title: { en: "Kitchen Appliance Set", zh: "厨房小家电套装" },
      category: "kitchen",
      condition: "good",
      images: [],
      original_price: 200,
      asking_price: 80,
      description: {
        en: "Bundle of 3 kitchen essentials: Instant Pot Duo 6qt, Cuisinart toaster, and T-fal electric kettle. All in working condition with normal wear.",
        zh: "厨房必备3件套：Instant Pot Duo 6夸脱电压力锅、Cuisinart烤面包机、特福电热水壶。全部正常使用，有正常使用痕迹。"
      },
      available_from: "2026-05-01",
      available_until: "2026-05-30",
      allow_viewing: true,
      sell_priority: 1,
      status: "available",
      tags: ["kitchen", "instant-pot", "toaster", "kettle", "appliances"]
    }
  ],
  bundles: [
    {
      id: "bundle-001",
      title: { en: "Bedroom Set", zh: "卧室套装" },
      item_ids: ["item-001", "item-004"],
      bundle_price: 160,
      description: {
        en: "Complete bedroom setup: Queen bed frame + KALLAX shelf for nightstand/storage. Save $20 when you buy together!",
        zh: "完整卧室配置：双人床架 + KALLAX书架可作床头柜/收纳。一起买省$20！"
      }
    }
  ]
}
