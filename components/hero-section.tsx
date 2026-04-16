'use client'

import { useMemo } from 'react'
import { MapPin, Calendar } from 'lucide-react'
import { Logo } from './logo'
import { useApp } from '@/lib/app-context'

export function HeroSection() {
  const { data, lang, t } = useApp()

  const daysUntilMoving = useMemo(() => {
    const movingDate = new Date(data.meta.moving_date)
    const today = new Date()
    const diffTime = movingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }, [data.meta.moving_date])

  const tagline = {
    en: 'Moving sale',
    zh: '搬家清仓'
  }

  const countdownText = {
    en: `Moving in ${daysUntilMoving} days`,
    zh: `还有 ${daysUntilMoving} 天搬家`
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
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
            {t(tagline)}
          </h1>
          
          {/* Seller info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{data.meta.location}</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium">{data.meta.seller_name}</span>
            </div>
          </div>
          
          {/* Countdown */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-warm border">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {t(countdownText)}
            </span>
            <span className="animate-gentle-pulse inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {daysUntilMoving}
            </span>
          </div>
          
          {/* Contact hint */}
          <p className="text-sm text-muted-foreground max-w-md">
            {lang === 'zh' 
              ? `联系方式: ${data.meta.contact}` 
              : `Contact: ${data.meta.contact}`
            }
          </p>
        </div>
      </div>
    </section>
  )
}
