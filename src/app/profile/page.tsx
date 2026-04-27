"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  Users, 
  FileText, 
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { getOrCreateProfile, type UserProfile } from '@/lib/db'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const p = await getOrCreateProfile(user.uid, {
          fullName: user.displayName || 'Utilisateur',
          avatarUrl: user.photoURL || ''
        })
        setProfile(p)
      }
      setLoading(false)
    })
    return () => unsubscribe()
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
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-slate-500">Veuillez vous connecter pour voir votre profil.</p>
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
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback>{profile.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left pb-4">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">{profile.fullName}</h1>
                <p className="text-lg text-primary font-medium">{profile.username}</p>
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
                  {profile.bio}
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

                <div className="flex gap-4 mt-8 pt-8 border-t">
                  <div className="text-center flex-1">
                    <p className="text-xl font-bold">{profile.followers || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Abonnés</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xl font-bold">{profile.following || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Abonnements</p>
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
                  <p className="text-slate-500">Aucune activité récente pour le moment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
