
"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  MapPin, 
  Edit, 
  FileText, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getOrCreateProfile, type Profile } from '@/lib/db'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const p = await getOrCreateProfile(session.user.id, {
          full_name: session.user.user_metadata?.full_name || 'Utilisateur',
          avatar_url: session.user.user_metadata?.avatar_url || ''
        })
        setProfile(p)
      }
      setLoading(false)
    }

    getProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const p = await getOrCreateProfile(session.user.id, {
          full_name: session.user.user_metadata?.full_name || 'Utilisateur',
          avatar_url: session.user.user_metadata?.avatar_url || ''
        })
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Profil non configuré</h2>
          <p className="text-slate-500 mb-8">Veuillez vous connecter ou configurer Supabase pour voir votre profil.</p>
          <Button asChild className="rounded-full px-8">
            <a href="/auth">Se connecter</a>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary to-secondary relative">
          <Button variant="secondary" className="absolute bottom-4 right-4 rounded-full bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20">
            <Edit className="w-4 h-4 mr-2" /> Modifier la couverture
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-24 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-white shadow-xl bg-white">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left pb-4">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">{profile.full_name}</h1>
                <p className="text-lg text-primary font-medium">@{profile.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-4 self-center md:self-end">
              <Button className="rounded-full px-8">Modifier le Profil</Button>
              <Button variant="outline" className="rounded-full bg-white shadow-sm px-8">Partager</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-headline font-bold text-lg mb-4">À propos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {profile.bio || "Membre de la communauté LibreShare sur Supabase."}
                </p>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Non spécifié</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Inscrit récemment</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg">Activité Récente</h3>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    Tout voir <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500">Aucune activité récente sur Supabase pour le moment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
