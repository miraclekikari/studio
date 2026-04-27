
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, User, Library, Settings, LogOut, Compass, Sparkles, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { getOrCreateProfile, type Profile } from '@/lib/db'
import { useToast } from '@/hooks/use-toast'

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const p = await getOrCreateProfile(session.user.id, {
          full_name: session.user.user_metadata?.full_name || 'Membre',
        })
        setProfile(p)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const p = await getOrCreateProfile(session.user.id, {
          full_name: session.user.user_metadata?.full_name || 'Membre',
        })
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Library className="w-5 h-5 text-white" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight hidden sm:inline-block">Studio</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <Link href="/explore" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">
            <Compass className="w-4 h-4" /> Explorer
          </Link>
          <Link href="/assistant" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Assistant
          </Link>
          <Link href="/library" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">
            <Library className="w-4 h-4" /> Ma Bibliothèque
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 bg-slate-100 border-none rounded-full h-10 w-48 focus:w-64 transition-all duration-300 focus-visible:ring-primary"
            />
          </div>

          {loading ? (
            <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
          ) : profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 border-2 border-transparent hover:border-primary/20 transition-all">
                  <Avatar className="h-10 w-10 shadow-sm">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="font-bold text-primary bg-primary/10">{profile.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 rounded-[2rem] p-3 shadow-2xl border-slate-100" align="end">
                <DropdownMenuLabel className="font-normal px-4 py-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-bold leading-none">{profile.full_name}</p>
                    <p className="text-xs font-medium text-slate-400">@{profile.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer">
                  <Link href="/profile" className="w-full flex items-center">
                    <User className="mr-3 h-4 w-4 text-slate-400" /> Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer">
                  <Link href="/auth" className="w-full flex items-center text-primary font-bold">
                    <UserPlus className="mr-3 h-4 w-4" /> Changer de compte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 focus:bg-red-50 focus:text-red-600 rounded-xl px-4 py-3 cursor-pointer font-bold" 
                  onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                >
                  <LogOut className="mr-3 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" className="rounded-full px-8 h-10 font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/auth">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
