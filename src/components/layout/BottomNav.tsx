"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Library, User, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Accueil', href: '/' },
    { icon: Search, label: 'Explorer', href: '#' },
    { icon: Sparkles, label: 'IA', href: '#' },
    { icon: Library, label: 'Ma Liste', href: '/library' },
    { icon: User, label: 'Profil', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}