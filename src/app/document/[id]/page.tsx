
"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Share2, 
  Heart, 
  Eye, 
  Sparkles, 
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

  const handleLike = async () => {
    if (!userId || !docData?.id) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour aimer ce document.", variant: "destructive" })
      return
    }

    try {
      await toggleLikeDocument(docData.id, userId)
      toast({ title: "Document aimé !" })
      // Rafraîchir localement ou via service
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
      toast({ title: "Erreur IA", description: "Impossible de générer le résumé.", variant: "destructive" })
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
          <p className="text-slate-500 font-medium">Récupération des données Supabase...</p>
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
          <Button onClick={() => router.push('/')} className="rounded-full px-8">Retour</Button>
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
          Retour à la bibliothèque
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-xl border overflow-hidden">
              {docData.thumbnail_url ? (
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden">
                  <iframe 
                    src={docData.file_url} 
                    className="w-full h-full border-none"
                    title={docData.title}
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                  <div className="text-center p-12">
                    <FileText className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Prévisualisation indisponible</p>
                  </div>
                </div>
              )}
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
                    <p className="text-xs text-slate-400 font-medium">Contributeur Supabase</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLike}
                    className="rounded-full gap-2 border-slate-200 hover:bg-slate-50"
                  >
                    <Heart className="w-4 h-4" /> {docData.likes}
                  </Button>
                  <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/20 px-8" asChild>
                    <a href={docData.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <h2 className="text-xl font-headline font-bold text-slate-800">Détails</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      Partagé via Cloudinary
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <FileText className="w-4 h-4" />
                      Format {docData.format.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-headline font-bold text-slate-800">Tags IA</h2>
                  <div className="flex flex-wrap gap-2">
                    {docData.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-none rounded-full font-bold">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-10" />

              <h2 className="text-xl font-headline font-bold mb-4 text-slate-800">Description</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {docData.description}
              </p>
            </div>
          </div>

          {/* Assistant IA Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group sticky top-24">
              <h3 className="text-2xl font-headline font-bold flex items-center gap-3 mb-6 relative z-10">
                Assistant IA
              </h3>
              
              <div className="relative z-10">
                {!summary && !summarizing ? (
                  <>
                    <p className="text-base opacity-80 mb-8 leading-relaxed">
                      Laissez notre IA analyser ce document Supabase pour vous en générer un résumé.
                    </p>
                    <Button 
                      onClick={handleSummarize}
                      variant="secondary" 
                      className="w-full bg-white text-primary hover:bg-white/90 border-none font-bold rounded-full py-6"
                    >
                      Résumer
                    </Button>
                  </>
                ) : summarizing ? (
                  <div className="space-y-4 py-4">
                    <Skeleton className="h-5 w-full bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-[90%] bg-white/10 rounded-full" />
                    <p className="text-xs text-center animate-pulse opacity-60 font-bold mt-6">Analyse...</p>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/10 shadow-inner">
                    <p className="text-base leading-relaxed italic opacity-90">
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
