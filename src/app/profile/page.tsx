
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
  Heart,
  UserCircle2,
  Shield
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getOrCreateProfile, getUserStats, type Profile } from '@/lib/db'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ likes: 0, posts: 0 })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const p = await getOrCreateProfile(session.user.id, {
          full_name: session.user.user_metadata?.full_name || 'Utilisateur',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          email: session.user.email
        })
        setProfile(p)
        if (p) {
          const s = await getUserStats(p.id)
          setStats(s)
        }
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        init()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleEdit = () => {
    toast({ title: "Édition de profil", description: "Le formulaire d'édition sera disponible lors de la prochaine mise à jour." })
  }

  const handleShare = () => {
    if (profile) {
      const url = `${window.location.origin}/u/${profile.username}`
      navigator.clipboard.writeText(url)
      toast({ title: "Lien copié !", description: "Votre profil public est prêt à être partagé." })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin opacity-20" />
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="p-12 bg-white rounded-[3rem] shadow-2xl max-w-md border border-slate-100">
            <UserCircle2 className="w-24 h-24 text-slate-100 mx-auto mb-8" />
            <h2 className="text-3xl font-headline font-bold mb-4 text-slate-900">Espace Privé</h2>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed">Connectez-vous pour gérer votre bibliothèque et personnaliser votre profil.</p>
            <Button asChild className="w-full rounded-full h-16 text-xl font-bold shadow-xl shadow-primary/20">
              <a href="/auth">Accéder à mon Studio</a>
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
        <div className="h-72 md:h-96 bg-gradient-to-br from-primary via-secondary to-indigo-900 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <Button 
            onClick={() => toast({ title: "Personnalisation", description: "Le changement de couverture arrive bientôt !" })}
            variant="secondary" 
            className="absolute bottom-8 right-8 rounded-full bg-white/10 backdrop-blur-2xl text-white border-white/20 hover:bg-white/30 px-8 h-12 font-bold"
          >
            <Edit className="w-4 h-4 mr-2" /> Modifier l'ambiance
          </Button>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative -mt-24 md:-mt-32 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              <Avatar className="w-48 h-48 md:w-64 md:h-48 border-[10px] border-white shadow-2xl bg-white rounded-[3.5rem]">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-6xl font-black bg-primary/5 text-primary">{profile.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left pb-6">
                <div className="flex items-center gap-4 mb-2 justify-center md:justify-start">
                  <h1 className="text-5xl font-headline font-bold text-slate-900 tracking-tight">{profile.full_name}</h1>
                  <div className="p-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl text-primary font-bold flex items-center gap-2 justify-center md:justify-start">
                  <AtSign className="w-6 h-6" /> {profile.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-6 self-center md:self-end">
              <Button onClick={handleEdit} className="rounded-full px-12 h-16 font-bold text-xl shadow-2xl shadow-primary/20">Édition</Button>
              <Button onClick={handleShare} variant="outline" className="rounded-full bg-white shadow-xl px-10 h-16 border-none hover:bg-slate-50">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-32">
            <div className="space-y-10">
              <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10" />
                <h3 className="font-headline font-bold text-2xl mb-8 text-slate-800">Biographie</h3>
                <p className="text-slate-500 text-lg leading-relaxed mb-12 relative z-10">
                  {profile.bio || "Ce membre n'a pas encore partagé son histoire, mais son savoir est déjà précieux."}
                </p>
                
                <div className="space-y-5 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    <MapPin className="w-5 h-5 text-primary/40" />
                    <span>Réseau Studio • Actif</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    <Calendar className="w-5 h-5 text-primary/40" />
                    <span>Inscrit en 2024</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white shadow-2xl">
                <h3 className="font-headline font-bold text-xl mb-8 opacity-60 uppercase tracking-widest">Sujets de prédilection</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.interests?.map(interest => (
                    <span key={interest} className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl font-bold text-sm hover:bg-white/20 transition-colors cursor-default">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all duration-500">
                  <div className="p-6 bg-red-50 text-red-500 rounded-[2rem] group-hover:scale-110 transition-transform">
                    <Heart className="w-10 h-10 fill-current" />
                  </div>
                  <div>
                    <p className="text-5xl font-black text-slate-900">{stats.likes}</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Impact reçu</p>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all duration-500">
                  <div className="p-6 bg-blue-50 text-blue-500 rounded-[2rem] group-hover:scale-110 transition-transform">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-5xl font-black text-slate-900">{stats.posts}</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Savoirs partagés</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3.5rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="border-b px-12 py-10 flex items-center justify-between bg-slate-50/30">
                  <h3 className="font-headline font-bold text-3xl">Activité Récente</h3>
                  <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-white rounded-full px-6" onClick={() => toast({ title: "Historique", description: "L'historique complet sera disponible bientôt." })}>
                    Tout voir <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                <div className="p-24 text-center">
                  <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner rotate-3">
                    <FileText className="w-12 h-12 text-slate-200" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-4">Silence créatif</h4>
                  <p className="text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed">Vos contributions et interactions apparaîtront ici pour construire votre héritage numérique.</p>
                  <Button className="mt-12 rounded-full px-12 h-14 text-lg font-bold" asChild>
                    <a href="/library">Publier un document</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
