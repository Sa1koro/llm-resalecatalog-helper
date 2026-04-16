'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Settings, 
  MapPin, 
  Calendar, 
  User, 
  Lock, 
  Plus, 
  Trash2, 
  GripVertical,
  MessageCircle,
  Phone,
  BookOpen
} from 'lucide-react'
import { CONTACT_PLATFORM_INFO, type ContactPlatform, type ContactMethod } from '@/lib/types'
import { toast } from 'sonner'

const PLATFORM_OPTIONS: ContactPlatform[] = ['wechat', 'xiaohongshu', 'phone', 'facebook', 'discord', 'qq']

export function SettingsPanel() {
  const { data, updateSettings, addContactMethod, updateContactMethod, deleteContactMethod, t, lang } = useApp()
  const { settings, contactMethods } = data

  const [localSettings, setLocalSettings] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState<{ platform: ContactPlatform; value: string; label: string }>({
    platform: 'wechat',
    value: '',
    label: '',
  })

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await updateSettings({
        seller_name: localSettings.seller_name,
        location: localSettings.location,
        moving_date: localSettings.moving_date,
      })
      toast.success(lang === 'zh' ? '设置已保存' : 'Settings saved')
    } catch (error) {
      toast.error(lang === 'zh' ? '保存失败' : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleAddContact = async () => {
    if (!newContact.value.trim()) {
      toast.error(lang === 'zh' ? '请填写联系方式' : 'Please enter contact info')
      return
    }

    try {
      await addContactMethod({
        platform: newContact.platform,
        value: newContact.value.trim(),
        label: newContact.label.trim() || undefined,
        enabled: true,
        sort_order: contactMethods.length,
      })
      setNewContact({ platform: 'wechat', value: '', label: '' })
      setAddDialogOpen(false)
      toast.success(lang === 'zh' ? '联系方式已添加' : 'Contact added')
    } catch (error) {
      toast.error(lang === 'zh' ? '添加失败' : 'Failed to add')
    }
  }

  const handleToggleContact = async (id: string, enabled: boolean) => {
    await updateContactMethod(id, { enabled })
  }

  const handleDeleteContact = async (id: string) => {
    await deleteContactMethod(id)
    toast.success(lang === 'zh' ? '联系方式已删除' : 'Contact deleted')
  }

  const getPlatformIcon = (platform: ContactPlatform) => {
    switch (platform) {
      case 'wechat':
      case 'qq':
        return <MessageCircle className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'xiaohongshu':
        return <BookOpen className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {lang === 'zh' ? '基本设置' : 'Basic Settings'}
          </CardTitle>
          <CardDescription>
            {lang === 'zh' ? '配置卖家信息和搬家日期' : 'Configure seller info and moving date'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seller_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {lang === 'zh' ? '卖家名称' : 'Seller Name'}
              </Label>
              <Input
                id="seller_name"
                value={localSettings.seller_name}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, seller_name: e.target.value }))}
                placeholder={lang === 'zh' ? '输入卖家名称' : 'Enter seller name'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {lang === 'zh' ? '位置' : 'Location'}
              </Label>
              <Input
                id="location"
                value={localSettings.location || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, location: e.target.value }))}
                placeholder={lang === 'zh' ? '如：北京朝阳区' : 'e.g., San Francisco, CA'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moving_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {lang === 'zh' ? '搬家日期' : 'Moving Date'}
              </Label>
              <Input
                id="moving_date"
                type="date"
                value={localSettings.moving_date || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, moving_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {lang === 'zh' ? '管理员密码' : 'Admin Password'}
              </Label>
              <Input
                id="admin_password"
                type="password"
                value={localSettings.admin_password}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, admin_password: e.target.value }))}
                placeholder="******"
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (lang === 'zh' ? '保存中...' : 'Saving...') : (lang === 'zh' ? '保存设置' : 'Save Settings')}
          </Button>
        </CardContent>
      </Card>

      {/* Contact Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {lang === 'zh' ? '联系方式' : 'Contact Methods'}
              </CardTitle>
              <CardDescription>
                {lang === 'zh' ? '添加和管理联系方式，显示在主页' : 'Add and manage contact info shown on homepage'}
              </CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  {lang === 'zh' ? '添加' : 'Add'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === 'zh' ? '添加联系方式' : 'Add Contact Method'}</DialogTitle>
                  <DialogDescription>
                    {lang === 'zh' ? '选择平台并输入联系方式' : 'Select platform and enter contact info'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{lang === 'zh' ? '平台' : 'Platform'}</Label>
                    <Select
                      value={newContact.platform}
                      onValueChange={(v) => setNewContact(prev => ({ ...prev, platform: v as ContactPlatform }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_OPTIONS.map(platform => (
                          <SelectItem key={platform} value={platform}>
                            {t(CONTACT_PLATFORM_INFO[platform].label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === 'zh' ? '联系方式/链接' : 'Contact/Link'}</Label>
                    <Input
                      value={newContact.value}
                      onChange={(e) => setNewContact(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={
                        newContact.platform === 'wechat' ? (lang === 'zh' ? '微信号' : 'WeChat ID') :
                        newContact.platform === 'phone' ? (lang === 'zh' ? '手机号' : 'Phone number') :
                        newContact.platform === 'qq' ? (lang === 'zh' ? 'QQ号' : 'QQ number') :
                        (lang === 'zh' ? '用户名或链接' : 'Username or link')
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === 'zh' ? '显示标签（可选）' : 'Display Label (optional)'}</Label>
                    <Input
                      value={newContact.label}
                      onChange={(e) => setNewContact(prev => ({ ...prev, label: e.target.value }))}
                      placeholder={lang === 'zh' ? '如：工作微信' : 'e.g., Work WeChat'}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    {lang === 'zh' ? '取消' : 'Cancel'}
                  </Button>
                  <Button onClick={handleAddContact}>
                    {lang === 'zh' ? '添加' : 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {contactMethods.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {lang === 'zh' ? '暂无联系方式，点击上方按钮添加' : 'No contacts yet, click Add to create one'}
            </div>
          ) : (
            <div className="space-y-2">
              {contactMethods.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {getPlatformIcon(contact.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {contact.label || t(CONTACT_PLATFORM_INFO[contact.platform].label)}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {contact.value}
                    </div>
                  </div>
                  <Switch
                    checked={contact.enabled}
                    onCheckedChange={(checked) => handleToggleContact(contact.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
