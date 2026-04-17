'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, Check, ExternalLink, Camera, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/lib/app-context'
import { toast } from 'sonner'
import { CONDITION_LABELS, type Condition } from '@/lib/types'

type PromptLanguage = 'zh' | 'en' | 'bilingual'
type PromptType = 'visual' | 'text'

const CONDITIONS: Condition[] = ['like-new', 'good', 'fair', 'well-loved']

export function PromptTool() {
  const { setRoute, t, lang } = useApp()
  
  const [itemName, setItemName] = useState('')
  const [condition, setCondition] = useState<Condition>('good')
  const [askingPrice, setAskingPrice] = useState('')
  const [purchaseLink, setPurchaseLink] = useState('')
  const [notes, setNotes] = useState('')
  const [promptLang, setPromptLang] = useState<PromptLanguage>('bilingual')
  const [promptType, setPromptType] = useState<PromptType>('visual')
  const [copied, setCopied] = useState(false)

  const labels = {
    title: { en: 'AI Prompt Generator', zh: 'AI 提示词生成器' },
    subtitle: { en: 'Generate prompts for ChatGPT, Gemini, Doubao, Kimi to help you create item listings', zh: '生成提示词，让 ChatGPT、Gemini、豆包、Kimi 帮你创建物品信息' },
    back: { en: 'Back to Admin', zh: '返回管理后台' },
    step1: { en: 'Step 1: Fill in basic info', zh: '第一步：填写基本信息' },
    step2: { en: 'Step 2: Choose prompt type', zh: '第二步：选择提示词类型' },
    step3: { en: 'Step 3: Copy and use', zh: '第三步：复制并使用' },
    itemName: { en: 'Item name (optional)', zh: '物品名称（可选）' },
    itemNamePlaceholder: { en: 'e.g., IKEA desk lamp', zh: '例如：宜家台灯' },
    condition: { en: 'Condition', zh: '成色' },
    askingPrice: { en: 'Asking price (CAD)', zh: '售价（加元）' },
    purchaseLink: { en: 'Purchase link (optional)', zh: '商品链接（可选）' },
    notes: { en: 'Additional notes', zh: '额外备注' },
    notesPlaceholder: { en: 'e.g., has a small scratch on base', zh: '例如：底座有轻微划痕' },
    promptLanguage: { en: 'Output language', zh: '输出语言' },
    chinese: { en: 'Chinese', zh: '中文' },
    english: { en: 'English', zh: '英文' },
    bilingual: { en: 'Bilingual', zh: '双语' },
    visualPrompt: { en: 'Visual Model Prompt', zh: '视觉模型提示词' },
    visualDesc: { en: 'For GPT-4o, Gemini 1.5 Pro, etc. that accept image uploads', zh: '适用于支持图片上传的 GPT-4o、Gemini 1.5 Pro 等' },
    textPrompt: { en: 'Text-Only Prompt', zh: '纯文本提示词' },
    textDesc: { en: 'For models without vision - describe the item manually', zh: '适用于不支持图片的模型 - 需手动描述物品' },
    copyPrompt: { en: 'Copy Prompt', zh: '复制提示词' },
    copied: { en: 'Copied! Now paste into your AI chat and attach your photos', zh: '已复制！现在粘贴到 AI 聊天并附上物品照片' },
    quickLinks: { en: 'Quick links to AI assistants:', zh: '快速打开 AI 助手：' },
    tip: { en: 'Tip: Attach your item photo and optionally the purchase page URL, then send!', zh: '提示：附上物品照片，也可以附上商品页面链接，然后发送！' },
  }

  const generatePrompt = (): string => {
    const langInstructions = promptLang === 'zh' 
      ? '请用中文输出所有内容。'
      : promptLang === 'en'
      ? 'Please output all content in English.'
      : '请同时提供中英双语版本。Please provide both Chinese and English versions.'

    const itemInfo = `
${itemName ? `物品名称提示 / Item name hint: ${itemName}` : ''}
成色 / Condition: ${CONDITION_LABELS[condition].en} / ${CONDITION_LABELS[condition].zh}
${askingPrice ? `售价 / Asking price: CAD $${askingPrice}` : ''}
${purchaseLink ? `商品链接 / Purchase link: ${purchaseLink}` : ''}
${notes ? `备注 / Notes: ${notes}` : ''}
`.trim()

    const jsonSchemaBlock = `{
  "items": [
    {
      "title_zh": "中文标题",
      "title_en": "English title",
      "category": "furniture | electronics | clothing | kitchen | sports | books | other",
      "condition": "${condition}",
      "status": "available",
      "original_price": 估算原价数字或 null,
      "asking_price": ${askingPrice || '根据成色和市场价估算的数字'},
      "description_zh": "中文描述（2-3句话）",
      "description_en": "English description (2-3 sentences)",
      "tags": ["相关标签", "最多5个"],
      "images": [],
      "bundle_id": null,
      "featured": false,
      "available_from": null,
      "available_until": null,
      "sell_priority": 5,
      "allow_viewing": true,
      "purchase_link": ${purchaseLink ? `"${purchaseLink}"` : 'null'},
      "notes_zh": null,
      "notes_en": null
    }
  ]
}`

    const commonRequirements = `要求 / Requirements:
1. 输出必须是顶层带 "items" 数组的对象（即使只有一个物品），导入工具按此结构解析
2. title_zh 必填；title_en / description_zh / description_en 可以为空字符串或有内容，不要写 null 字符串
3. category 只能从这些里选：furniture, electronics, clothing, kitchen, sports, books, other
4. condition 使用：like-new, good, fair, well-loved
5. asking_price 和 original_price 必须是数字（或 original_price 为 null），不要带货币符号
6. sell_priority 是 1-10 的数字，1 最急，10 最后卖；没特殊要求写 5
7. tags 最多 5 个简短关键词
8. images 留空数组 []，图片上传在管理后台另外做
9. 标签/描述要突出品牌、型号、成色、尺寸等便于搜索的关键词`

    if (promptType === 'visual') {
      return `你是一个二手物品销售助手。我正在准备出售一些物品，需要你帮我生成结构化的物品信息，用于导入到我的二手商店后台。

${langInstructions}

请仔细观察我上传的物品照片${purchaseLink ? '以及商品链接页面' : ''}，并根据以下信息生成完整的物品数据：

${itemInfo}

请根据图片和提供的信息，严格按以下 JSON Schema 输出（字段名必须完全一致）：

${jsonSchemaBlock}

${commonRequirements}

请附上你的物品照片${purchaseLink ? '' : '（可以同时附上原商品链接）'}，然后发送！

**只输出有效的 JSON，不要加任何 Markdown 代码块标记或解释文字。**`
    } else {
      return `你是一个二手物品销售助手。我正在准备出售一些物品，需要你帮我生成结构化的物品信息，用于导入到我的二手商店后台。

${langInstructions}

由于你无法查看图片，请根据我提供的物品描述来生成数据。

我提供的信息：
${itemInfo}

请根据以上信息，严格按以下 JSON Schema 输出（字段名必须完全一致）：

${jsonSchemaBlock}

${commonRequirements}

**在发送之前，请详细描述你的物品：**
- 品牌和型号
- 颜色和尺寸
- 购买时间和使用频率
- 任何瑕疵或特殊情况

**只输出有效的 JSON，不要加任何 Markdown 代码块标记或解释文字。**`
    }
  }

  const handleCopy = () => {
    const prompt = generatePrompt()
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    toast.success(t(labels.copied))
    setTimeout(() => setCopied(false), 3000)
  }

  const aiLinks = [
    { name: 'ChatGPT', url: 'https://chat.openai.com' },
    { name: 'Gemini', url: 'https://gemini.google.com' },
    { name: 'Kimi', url: 'https://kimi.moonshot.cn' },
    { name: '豆包', url: 'https://www.doubao.com' },
  ]

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

      {/* Step 1: Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t(labels.step1)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t(labels.itemName)}</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={t(labels.itemNamePlaceholder)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t(labels.condition)}</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {t(CONDITION_LABELS[cond])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t(labels.askingPrice)}</Label>
              <Input
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label>{t(labels.promptLanguage)}</Label>
              <Select value={promptLang} onValueChange={(v) => setPromptLang(v as PromptLanguage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bilingual">{t(labels.bilingual)}</SelectItem>
                  <SelectItem value="zh">{t(labels.chinese)}</SelectItem>
                  <SelectItem value="en">{t(labels.english)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t(labels.purchaseLink)}</Label>
            <Input
              type="url"
              value={purchaseLink}
              onChange={(e) => setPurchaseLink(e.target.value)}
              placeholder="https://www.ikea.com/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t(labels.notes)}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(labels.notesPlaceholder)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Prompt Type */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t(labels.step2)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={promptType} onValueChange={(v) => setPromptType(v as PromptType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual" className="gap-2">
                <Camera className="h-4 w-4" />
                {t(labels.visualPrompt)}
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <FileText className="h-4 w-4" />
                {t(labels.textPrompt)}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="pt-4">
              <p className="text-sm text-muted-foreground">
                {t(labels.visualDesc)}
              </p>
            </TabsContent>
            <TabsContent value="text" className="pt-4">
              <p className="text-sm text-muted-foreground">
                {t(labels.textDesc)}
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Step 3: Generated Prompt */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t(labels.step3)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={generatePrompt()}
            readOnly
            rows={12}
            className="font-mono text-sm bg-muted"
          />
          
          <Button 
            onClick={handleCopy}
            className="w-full rounded-full"
            size="lg"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                {t(labels.copied)}
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                {t(labels.copyPrompt)}
              </>
            )}
          </Button>
          
          {/* Quick links */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              {t(labels.quickLinks)}
            </p>
            <div className="flex flex-wrap gap-2">
              {aiLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1.5" />
                    {link.name}
                  </a>
                </Button>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground bg-secondary/10 p-3 rounded-lg">
            {t(labels.tip)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
