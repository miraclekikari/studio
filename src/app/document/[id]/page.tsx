"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Heart, 
  Eye, 
  ChevronLeft, 
  FileText,
  Loader2,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { summarizeDocument } from '@/ai/flows/ai-document-summarization-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { getDocumentById, incrementDocumentViews, type Document, toggleLikeDocument } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [docData, setDocData] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      if (typeof id !== 'string') return
      try {
        const data = await getDocumentById(id)
        if (data) {
          setDocData(data)
          incrementDocumentViews(id).catch(console.error)
        }
      } catch (err) {
        console.error("Error fetching doc:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  const getDownloadUrl = (url: string) => {
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  }

  const handleLike = async () => {
    if (!userId || !docData?.id) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour aimer ce document.", variant: "destructive" })
      return
    }

    try {
      await toggleLikeDocument(docData.id, userId)
      toast({ title: "Merci pour votre vote !" })
      setDocData(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSummarize = async () => {
    if (!docData) return
    setSummarizing(true)
    try {
      const content = `Titre: ${docData.title}. Description: ${docData.description}`
      const result = await summarizeDocument({ documentContent: content })
      setSummary(result.summary)
    } catch (err) {
      console.error(err)
      toast({ title: "Analyse interrompue", description: "L'assistant n'a pas pu traiter ce document.", variant: "destructive" })
    } finally {
      setSummarizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accès au savoir...</p>
        </main>
      </div>
    )
  }

  if (!docData) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Document non trouvé</h1>
          <Button onClick={() => router.push('/')} className="rounded-full px-8">Retour à l'accueil</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 group transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-xl border overflow-hidden">
              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100">
                {docData.format === 'pdf' || docData.file_url.includes('.pdf') ? (
                  <iframe 
                    src={docData.file_url} 
                    className="w-full h-full border-none"
                    title={docData.title}
                  />
                ) : (
                  <img src={docData.file_url} alt={docData.title} className="w-full h-full object-contain" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border">
              <h1 className="text-4xl font-headline font-bold mb-6 text-slate-900 leading-tight">{docData.title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-10 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 ring-4 ring-primary/5 shadow-sm">
                    <AvatarImage src={docData.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{docData.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900">{docData.profiles?.full_name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">@{docData.profiles?.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleLike}
                    className="rounded-full gap-2 border-slate-200 hover:bg-slate-50 font-bold"
                  >
                    <Heart className="w-4 h-4" /> {docData.likes}
                  </Button>
                  <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/20 px-8 font-bold" asChild>
                    <a href={getDownloadUrl(docData.file_url)} download={docData.title}>
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <h2 className="text-xl font-headline font-bold text-slate-800">Métadonnées</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <Calendar className="w-4 h-4 text-primary/40" />
                      Publié récemment
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <FileText className="w-4 h-4 text-primary/40" />
                      Format {docData.format.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                      <Eye className="w-4 h-4 text-primary/40" />
                      {docData.views} consultations
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-headline font-bold text-slate-800">Thématiques</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-none rounded-full font-bold">
                      #{docData.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-10" />

              <h2 className="text-xl font-headline font-bold mb-4 text-slate-800">Description</h2>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">
                {docData.description}
              </p>
            </div>
          </div>

          {/* Assistant Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group sticky top-24">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <h3 className="text-2xl font-headline font-bold flex items-center gap-3 mb-6 relative z-10">
                Assistant Studio
              </h3>
              
              <div className="relative z-10">
                {!summary && !summarizing ? (
                  <>
                    <p className="text-base opacity-80 mb-8 leading-relaxed font-medium">
                      Interrogez notre intelligence pour obtenir une synthèse immédiate de ce document.
                    </p>
                    <Button 
                      onClick={handleSummarize}
                      variant="secondary" 
                      className="w-full bg-white text-primary hover:bg-white/90 border-none font-bold rounded-full py-6 shadow-xl"
                    >
                      Synthétiser
                    </Button>
                  </>
                ) : summarizing ? (
                  <div className="space-y-4 py-4">
                    <Skeleton className="h-5 w-full bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-[90%] bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-[95%] bg-white/10 rounded-full" />
                    <p className="text-xs text-center animate-pulse opacity-60 font-bold mt-6 uppercase tracking-widest">Analyse en cours...</p>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/10 shadow-inner">
                    <p className="text-base leading-relaxed italic opacity-90 font-medium">
                      "{summary}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}