
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
  Loader2,
  Share2,
  AtSign,
  Heart
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getOrCreateProfile, type Profile } from '@/lib/db'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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
          avatar_url: session.user.user_metadata?.avatar_url || '',
          email: session.user.email
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
          avatar_url: session.user.user_metadata?.avatar_url || '',
          email: session.user.email
        })
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleEdit = () => {
    toast({ title: "Édition de profil", description: "Le formulaire d'édition sera disponible très bientôt." })
  }

  const handleShare = () => {
    if (profile) {
      navigator.clipboard.writeText(`https://studio.app/u/${profile.username}`)
      toast({ title: "Lien copié !", description: "Votre lien de profil est prêt à être partagé." })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="p-6 bg-white rounded-[2rem] shadow-xl max-w-sm">
            <UserCircle2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Profil non configuré</h2>
            <p className="text-slate-500 mb-8">Veuillez vous connecter pour accéder à votre espace personnel.</p>
            <Button asChild className="w-full rounded-full h-12 text-lg font-bold">
              <a href="/auth">Se connecter</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1">
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary via-secondary to-indigo-900 relative">
          <div className="absolute inset-0 bg-black/10" />
          <Button 
            onClick={() => toast({ title: "Couverture", description: "Bientôt personnalisable !" })}
            variant="secondary" 
            className="absolute bottom-6 right-6 rounded-full bg-white/10 backdrop-blur-xl text-white border-white/20 hover:bg-white/30 px-6"
          >
            <Edit className="w-4 h-4 mr-2" /> Modifier la couverture
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-20 md:-mt-32 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <Avatar className="w-40 h-40 md:w-56 md:h-40 border-8 border-white shadow-2xl bg-white rounded-[3rem]">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary">{profile.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left pb-4">
                <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
                  <h1 className="text-4xl md:text-5xl font-headline font-bold text-slate-900 tracking-tight">{profile.full_name}</h1>
                  <div className="p-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xl text-primary font-bold flex items-center gap-2 justify-center md:justify-start">
                  <AtSign className="w-5 h-5" /> {profile.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-4 self-center md:self-end">
              <Button onClick={handleEdit} className="rounded-full px-10 h-14 font-bold text-lg shadow-xl shadow-primary/20">Modifier le Profil</Button>
              <Button onClick={handleShare} variant="outline" className="rounded-full bg-white shadow-sm px-8 h-14 border-slate-200">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <h3 className="font-headline font-bold text-2xl mb-6 text-slate-800">Bio</h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-10">
                  {profile.bio || "Aucune biographie n'a été ajoutée pour le moment."}
                </p>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    <MapPin className="w-4 h-4" />
                    <span>Terre • Univers</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>Inscrit en 2024</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-[2.5rem] p-10">
                <h3 className="font-headline font-bold text-xl mb-6">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.interests?.map(interest => (
                    <span key={interest} className="px-5 py-2.5 bg-white rounded-full font-bold text-sm text-primary shadow-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="border-b px-10 py-8 flex items-center justify-between bg-slate-50/30">
                  <h3 className="font-headline font-bold text-2xl">Activité Récente</h3>
                  <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-white" onClick={() => toast({ title: "Historique", description: "Bientôt disponible !" })}>
                    Tout voir <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <div className="p-20 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <FileText className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Aucun document partagé</h4>
                  <p className="text-slate-400 max-w-xs mx-auto font-medium">Commencez à contribuer pour voir vos documents s'afficher ici.</p>
                  <Button className="mt-8 rounded-full px-8 h-12" asChild>
                    <a href="/library">Ajouter un document</a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className="p-5 bg-red-50 text-red-500 rounded-3xl">
                    <Heart className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">0</p>
                    <p className="text-sm font-bold text-slate-400 uppercase">Likes reçus</p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className="p-5 bg-blue-50 text-blue-500 rounded-3xl">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">0</p>
                    <p className="text-sm font-bold text-slate-400 uppercase">Publications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import { Shield, UserCircle2 } from 'lucide-react'
