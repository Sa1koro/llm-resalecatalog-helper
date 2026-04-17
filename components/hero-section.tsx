'use client'

import { useMemo } from 'react'
import { MapPin, Calendar, MessageCircle, Phone, BookOpen, ExternalLink, Copy } from 'lucide-react'
import { Logo } from './logo'
import { useApp } from '@/lib/app-context'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CONTACT_PLATFORM_INFO, type ContactPlatform } from '@/lib/types'
import { toast } from 'sonner'

// Platform-specific icons
function ContactIcon({ platform }: { platform: ContactPlatform }) {
  switch (platform) {
    case 'wechat':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
        </svg>
      )
    case 'qq':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.239 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
        </svg>
      )
    case 'xiaohongshu':
      return <BookOpen className="h-4 w-4" />
    case 'phone':
      return <Phone className="h-4 w-4" />
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    case 'discord':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
        </svg>
      )
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

function getContactUrl(platform: ContactPlatform, value: string): string | null {
  const info = CONTACT_PLATFORM_INFO[platform]
  if (info.copyable) return null
  
  if (info.urlPrefix) {
    // If value is already a full URL, use it directly
    if (value.startsWith('http')) return value
    // For phone, format properly
    if (platform === 'phone') return `tel:${value.replace(/\D/g, '')}`
    return `${info.urlPrefix}${value}`
  }
  
  // If value is a full URL, use it
  if (value.startsWith('http')) return value
  
  return null
}

export function HeroSection() {
  const { data, lang, t, loading } = useApp()
  const { settings, contactMethods } = data

  const daysUntilMoving = useMemo(() => {
    if (!settings.moving_date) return null
    const movingDate = new Date(settings.moving_date)
    const today = new Date()
    const diffTime = movingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }, [settings.moving_date])

  const enabledContacts = contactMethods.filter(c => c.enabled)

  const handleContactClick = (contact: typeof contactMethods[0]) => {
    const url = getContactUrl(contact.platform, contact.value)
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(contact.value)
      toast.success(lang === 'zh' ? `已复制: ${contact.value}` : `Copied: ${contact.value}`)
    }
  }

  const tagline = {
    en: 'Moving sale',
    zh: '搬家清仓'
  }

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
        <div className="container px-4 py-12 md:py-16 lg:py-20">
          <div className="flex flex-col items-center text-center gap-6 animate-pulse">
            <div className="h-16 w-48 bg-muted rounded" />
            <div className="h-10 w-64 bg-muted rounded" />
            <div className="h-6 w-48 bg-muted rounded" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-primary/5 blur-xl" />
      
      <div className="container relative px-4 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <Logo size="lg" className="mb-2" />
          
          {/* Tagline */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-balance">
            {t(tagline)}
          </h1>
          
          {/* Seller info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            {settings.location && (
              <>
                <button
                  onClick={() => window.open(`https://maps.google.com/maps/search/${encodeURIComponent(settings.location)}`, '_blank')}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer group"
                  title={lang === 'zh' ? '在Google地图中打开' : 'Open in Google Maps'}
                >
                  <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="underline decoration-dashed underline-offset-2">{settings.location}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <span className="hidden sm:inline text-border">|</span>
              </>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium">{settings.seller_name}</span>
            </div>
          </div>
          
          {/* Countdown */}
          {daysUntilMoving !== null && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-warm border">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                {lang === 'zh' ? `还有 ${daysUntilMoving} 天搬家` : `Moving in ${daysUntilMoving} days`}
              </span>
              <span className="animate-gentle-pulse inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {daysUntilMoving}
              </span>
            </div>
          )}
          
          {/* Contact Methods */}
          {enabledContacts.length > 0 && (
            <div className="flex flex-col items-center gap-3 mt-2">
              <p className="text-sm text-muted-foreground">
                {lang === 'zh' ? '联系方式' : 'Contact'}
              </p>
              <TooltipProvider>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {enabledContacts.map((contact) => {
                    const info = CONTACT_PLATFORM_INFO[contact.platform]
                    const url = getContactUrl(contact.platform, contact.value)
                    const isCopyable = !url
                    
                    return (
                      <Tooltip key={contact.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={() => handleContactClick(contact)}
                          >
                            <ContactIcon platform={contact.platform} />
                            <span className="hidden sm:inline">
                              {contact.label || t(info.label)}
                            </span>
                            {isCopyable ? (
                              <Copy className="h-3 w-3 opacity-50" />
                            ) : (
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {isCopyable 
                              ? (lang === 'zh' ? `点击复制: ${contact.value}` : `Click to copy: ${contact.value}`)
                              : (lang === 'zh' ? '点击打开' : 'Click to open')
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
