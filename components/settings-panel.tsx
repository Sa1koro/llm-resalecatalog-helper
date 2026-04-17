'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, Plus, Copy, Check, MapPin, ExternalLink } from 'lucide-react'
import { ContactPlatform, CONTACT_PLATFORM_INFO } from '@/lib/types'
import { ImageUpload } from '@/components/image-upload'
import { toast } from 'sonner'

export function SettingsPanel() {
  const { data, updateSettings, addContactMethod, updateContactMethod, deleteContactMethod, lang } = useApp()
  const settings = data.settings
  const contactMethods = data.contactMethods
  const language = lang || 'zh'
  const [activeTab, setActiveTab] = useState('basic')
  const [sellerName, setSellerName] = useState(settings?.seller_name || '')
  const [location, setLocation] = useState(settings?.location || '')
  const [movingDate, setMovingDate] = useState(settings?.moving_date || '')
  const [adminPassword, setAdminPassword] = useState(settings?.admin_password || '')
  const [saving, setSaving] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const texts = {
    en: {
      settings: 'Settings',
      basicInfo: 'Basic Information',
      contactInfo: 'Contact Methods',
      sellerName: 'Seller Name',
      location: 'Location',
      movingDate: 'Moving Date',
      adminPassword: 'Admin Password',
      openMap: 'Open in Google Maps',
      save: 'Save',
      addContact: 'Add Contact',
      platform: 'Platform',
      identifier: 'Identifier',
      link: 'Custom Link',
      qrCode: 'QR Code',
      enable: 'Enable',
      disable: 'Disable',
      edit: 'Edit',
      delete: 'Delete',
      update: 'Update',
      cancel: 'Cancel',
      noContacts: 'No contact methods yet',
      copy: 'Copy',
      copied: 'Copied!',
      googleMapsLink: 'Google Maps',
      customPlatform: 'Custom',
      customPlatformName: 'Platform Name',
      saved: 'Saved successfully',
      uploadQRCode: 'Upload QR Code',
    },
    zh: {
      settings: '设置',
      basicInfo: '基本信息',
      contactInfo: '联系方式',
      sellerName: '卖家名称',
      location: '位置',
      movingDate: '搬家日期',
      adminPassword: '管理员密码',
      openMap: '在Google地图打开',
      save: '保存',
      addContact: '添加联系方式',
      platform: '平台',
      identifier: '识别码/ID',
      link: '自定义链接',
      qrCode: '二维码',
      enable: '启用',
      disable: '禁用',
      edit: '编辑',
      delete: '删除',
      update: '更新',
      cancel: '取消',
      noContacts: '还没有添加联系方式',
      copy: '复制',
      copied: '已复制!',
      googleMapsLink: '谷歌地图',
      customPlatform: '自定义',
      customPlatformName: '平台名称',
      saved: '保存成功',
      uploadQRCode: '上传二维码',
    }
  }

  const t = texts[language]
  const googleMapsUrl = location ? `https://maps.google.com/maps/search/${encodeURIComponent(location)}` : ''

  const handleSaveSettings = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await updateSettings({
        ...settings,
        seller_name: sellerName,
        location,
        moving_date: movingDate,
        admin_password: adminPassword,
      })
      toast.success(t.saved)
    } catch (error) {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(adminPassword)
    setCopied('password')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">{t.basicInfo}</TabsTrigger>
          <TabsTrigger value="contacts">{t.contactInfo}</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.basicInfo}</CardTitle>
              <CardDescription>管理你的卖家基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seller Name */}
              <div className="space-y-2">
                <Label htmlFor="seller-name">{t.sellerName}</Label>
                <Input
                  id="seller-name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder={language === 'zh' ? '输入卖家名称' : 'Enter seller name'}
                />
              </div>

              {/* Location with Google Maps */}
              <div className="space-y-2">
                <Label htmlFor="location">{t.location}</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={language === 'zh' ? 'e.g., 温哥华, 不列颠哥伦比亚' : 'e.g., Vancouver, BC'}
                  />
                  {googleMapsUrl && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(googleMapsUrl, '_blank')}
                      title={t.openMap}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Moving Date */}
              <div className="space-y-2">
                <Label htmlFor="moving-date">{t.movingDate}</Label>
                <Input
                  id="moving-date"
                  type="date"
                  value={movingDate}
                  onChange={(e) => setMovingDate(e.target.value)}
                />
              </div>

              {/* Admin Password */}
              <div className="space-y-2">
                <Label htmlFor="admin-password">{t.adminPassword}</Label>
                <div className="flex gap-2">
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                  >
                    {copied === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? '保存中...' : t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Methods Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t.contactInfo}</h3>
            <AddContactDialog onAdd={addContactMethod} language={language} />
          </div>

          {contactMethods && contactMethods.length > 0 ? (
            <div className="grid gap-4">
              {contactMethods.map((contact) => (
                <ContactMethodCard
                  key={contact.id}
                  contact={contact}
                  isEditing={editingContactId === contact.id}
                  onEdit={() => setEditingContactId(contact.id)}
                  onCancelEdit={() => setEditingContactId(null)}
                  onUpdate={(updated) => {
                    updateContactMethod(updated.id, updated)
                    setEditingContactId(null)
                  }}
                  onDelete={() => deleteContactMethod(contact.id)}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t.noContacts}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AddContactDialogProps {
  onAdd: (contact: any) => Promise<void>
  language: 'en' | 'zh'
}

function AddContactDialog({ onAdd, language }: AddContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<ContactPlatform>('wechat')
  const [value, setValue] = useState('')
  const [customLink, setCustomLink] = useState('')
  const [customName, setCustomName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const texts = language === 'zh' ? {
    add: '添加',
    cancel: '取消',
    platform: '平台',
    identifier: '识别码/ID',
    link: '自定义链接 (可选)',
    platformName: '平台名称 (必填)',
  } : {
    add: 'Add',
    cancel: 'Cancel',
    platform: 'Platform',
    identifier: 'Identifier/ID',
    link: 'Custom Link (optional)',
    platformName: 'Platform Name (required)',
  }

  const handleAdd = async () => {
    if (!value.trim()) {
      toast.error(language === 'zh' ? '请输入识别码' : 'Please enter identifier')
      return
    }
    if (platform === 'custom' && !customName.trim()) {
      toast.error(language === 'zh' ? '请输入平台名称' : 'Please enter platform name')
      return
    }

    setIsLoading(true)
    try {
      await onAdd({
        platform,
        value,
        link: customLink || null,
        label: platform === 'custom' ? customName : undefined,
        enabled: true,
        sort_order: 0,
        qr_code_url: null,
      })
      setPlatform('wechat')
      setValue('')
      setCustomLink('')
      setCustomName('')
      setOpen(false)
      toast.success(language === 'zh' ? '添加成功' : 'Added successfully')
    } catch (error) {
      toast.error(language === 'zh' ? '添加失败' : 'Failed to add')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'zh' ? '添加' : 'Add'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{language === 'zh' ? '添加联系方式' : 'Add Contact Method'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{texts.platform}</Label>
            <Select value={platform} onValueChange={(val) => setPlatform(val as ContactPlatform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTACT_PLATFORM_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {language === 'zh' ? info.label.zh : info.label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{texts.identifier}</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={language === 'zh' ? '如: 用户名、电话号码、ID' : 'e.g., username, phone, ID'}
            />
          </div>

          <div>
            <Label>{texts.link}</Label>
            <Input
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {platform === 'custom' && (
            <div>
              <Label>{texts.platformName}</Label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={language === 'zh' ? '如: 官网' : 'e.g., Website'}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={handleAdd} disabled={isLoading} className="flex-1">
              {isLoading ? '...' : texts.add}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ContactMethodCardProps {
  contact: any
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onUpdate: (contact: any) => void
  onDelete: () => void
  language: 'en' | 'zh'
}

function ContactMethodCard({
  contact,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  language,
}: ContactMethodCardProps) {
  const [editValue, setEditValue] = useState(contact.value)
  const [editLink, setEditLink] = useState(contact.link || '')
  const [uploadingQR, setUploadingQR] = useState(false)

  const platformInfo = CONTACT_PLATFORM_INFO[contact.platform]
  const texts = language === 'zh' ? {
    save: '保存',
    cancel: '取消',
    uploadQR: '上传二维码',
    edit: '编辑',
    delete: '删除',
  } : {
    save: 'Save',
    cancel: 'Cancel',
    uploadQR: 'Upload QR Code',
    edit: 'Edit',
    delete: 'Delete',
  }

  if (isEditing) {
    return (
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="space-y-3">
          <div>
            <Label className="text-sm">{language === 'zh' ? '识别码' : 'Identifier'}</Label>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">{language === 'zh' ? '自定义链接' : 'Custom Link'}</Label>
            <Input
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">{texts.uploadQR}</Label>
            <ImageUpload
              onUpload={async (url) => {
                setUploadingQR(true)
                try {
                  onUpdate({
                    ...contact,
                    value: editValue,
                    link: editLink || null,
                    qr_code_url: url,
                  })
                } finally {
                  setUploadingQR(false)
                }
              }}
              isLoading={uploadingQR}
            />
            {contact.qr_code_url && (
              <img
                src={contact.qr_code_url}
                alt="QR Code"
                className="mt-2 w-24 h-24 border rounded"
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onUpdate({
                  ...contact,
                  value: editValue,
                  link: editLink || null,
                })
              }}
            >
              {texts.save}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              {texts.cancel}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {language === 'zh' ? platformInfo.label.zh : platformInfo.label.en}
              </Badge>
              {contact.enabled && <Badge className="bg-green-100 text-green-800">ON</Badge>}
            </div>
            <p className="text-sm font-mono text-gray-600">{contact.value}</p>
            {contact.link && (
              <p className="text-xs text-blue-600 mt-1">
                <a href={contact.link} target="_blank" rel="noopener noreferrer" className="underline">
                  {contact.link}
                </a>
              </p>
            )}
            {contact.qr_code_url && (
              <img
                src={contact.qr_code_url}
                alt="QR"
                className="mt-2 w-16 h-16 border rounded"
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
