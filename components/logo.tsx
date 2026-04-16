'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Box base */}
        <path
          d="M8 18L24 10L40 18V34L24 42L8 34V18Z"
          className="fill-primary/20 stroke-primary"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Box front face */}
        <path
          d="M8 18L24 26L40 18"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Box center line */}
        <path
          d="M24 26V42"
          className="stroke-primary"
          strokeWidth="2"
        />
        {/* Box flap left */}
        <path
          d="M8 18L16 12L24 18"
          className="fill-primary/30 stroke-primary"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Box flap right */}
        <path
          d="M40 18L32 12L24 18"
          className="fill-primary/30 stroke-primary"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Heart floating out */}
        <path
          d="M24 8C24 8 21 4 18 4C15 4 13 6 13 9C13 12 16 14 24 20C32 14 35 12 35 9C35 6 33 4 30 4C27 4 24 8 24 8Z"
          className="fill-primary"
          opacity="0.9"
        />
        {/* Sparkle */}
        <circle cx="36" cy="6" r="1.5" className="fill-secondary" />
        <circle cx="12" cy="8" r="1" className="fill-secondary" />
      </svg>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-serif font-semibold text-foreground', text)}>
            ResaleBox
          </span>
          <span className="text-xs text-muted-foreground">
            断舍离中心
          </span>
        </div>
      )}
    </div>
  )
}
