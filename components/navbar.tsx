'use client'

import { Lock, Moon, Sun, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'
import { useApp } from '@/lib/app-context'

export function Navbar() {
  const { lang, setLang, isDark, toggleDark, route, setRoute, isAuthenticated, logout } = useApp()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => setRoute('shop')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo size="md" />
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="font-medium"
          >
            {lang === 'zh' ? 'EN' : '中'}
          </Button>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            className="h-9 w-9"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Admin button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <Button
                variant={route === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRoute('admin')}
              >
                <Lock className="h-4 w-4 mr-1" />
                Admin
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRoute('admin')}
              className="h-9 w-9"
            >
              <Lock className="h-4 w-4" />
              <span className="sr-only">Admin login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
