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
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { summarizeDocument } from '@/ai/flows/ai-document-summarization-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { getDocumentById, incrementDocumentViews, type DocumentData } from '@/lib/db'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [docData, setDocData] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  
  useEffect(() => {
    async function fetchDoc() {
      if (typeof id !== 'string') return
      try {
        const data = await getDocumentById(id)
        if (data) {
          setDocData(data)
          // Incrémenter les vues
          incrementDocumentViews(id).catch(console.error)
        }
      } catch (err) {
        console.error("Error fetching doc:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [id])

  const handleSummarize = async () => {
    if (!docData) return
    setSummarizing(true)
    try {
      const content = `Titre: ${docData.title}. Description: ${docData.description}`
      const result = await summarizeDocument({ documentContent: content })
      setSummary(result.summary)
    } catch (err) {
      console.error(err)
    } finally {
      setSummarizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Analyse du document...</p>
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 group transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Retour à la bibliothèque
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-xl border overflow-hidden">
              <div className="aspect-[3/4] bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-100 relative overflow-hidden group">
                {docData.thumbnailUrl ? (
                  <img src={docData.thumbnailUrl} alt={docData.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="text-center p-12">
                    <FileText className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aperçu indisponible</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border">
              <h1 className="text-4xl font-headline font-bold mb-6 text-slate-900 leading-tight">{docData.title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-10 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 ring-4 ring-primary/5">
                    <AvatarImage src={docData.userAvatar || `https://picsum.photos/seed/${docData.userId}/100/100`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{docData.userName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900">{docData.userName}</p>
                    <p className="text-xs text-slate-400 font-medium">Contributeur certifié</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200 hover:bg-slate-50">
                    <Heart className="w-4 h-4" /> {docData.likes}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200 hover:bg-slate-50">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="lg" className="rounded-full gap-2 shadow-lg shadow-primary/20 px-8" asChild>
                    <a href={docData.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </Button>
                </div>
              </div>

              <h2 className="text-xl font-headline font-bold mb-4 text-slate-800">À propos de ce document</h2>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                {docData.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-4 py-1.5 font-bold bg-slate-100 text-slate-600 border-none rounded-full">
                  #{docData.category}
                </Badge>
                {docData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-4 py-1.5 font-bold bg-primary/5 text-primary border-none rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-secondary text-secondary-foreground rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-48 h-48" />
              </div>
              
              <h3 className="text-2xl font-headline font-bold flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                Assistant IA
              </h3>
              
              <div className="relative z-10">
                {!summary && !summarizing ? (
                  <>
                    <p className="text-base opacity-80 mb-8 leading-relaxed">
                      Besoin d'un aperçu rapide ? Notre IA analyse ce document pour vous en générer un résumé instantané.
                    </p>
                    <Button 
                      onClick={handleSummarize}
                      variant="secondary" 
                      className="w-full bg-white text-secondary hover:bg-white/90 border-none font-bold rounded-full py-6 text-lg shadow-xl shadow-black/10"
                    >
                      Résumer avec l'IA
                    </Button>
                  </>
                ) : summarizing ? (
                  <div className="space-y-4 py-4">
                    <Skeleton className="h-5 w-full bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-[90%] bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-[80%] bg-white/10 rounded-full" />
                    <Skeleton className="h-5 w-[95%] bg-white/10 rounded-full" />
                    <p className="text-xs text-center animate-pulse opacity-60 font-bold uppercase tracking-widest mt-6">Analyse neuronale en cours...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/10 shadow-inner">
                      <p className="text-base leading-relaxed italic opacity-90">
                        "{summary}"
                      </p>
                    </div>
                    <Button 
                      onClick={() => setSummary(null)}
                      variant="link" 
                      className="text-white/50 p-0 h-auto text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Effacer le résumé
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border">
              <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-3 text-slate-800">
                <div className="bg-slate-100 p-2 rounded-xl">
                  <Eye className="w-5 h-5 text-slate-500" />
                </div>
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50/50 rounded-3xl text-center border border-slate-50">
                  <p className="text-3xl font-bold text-primary mb-1">{docData.views}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Lectures</p>
                </div>
                <div className="p-5 bg-slate-50/50 rounded-3xl text-center border border-slate-50">
                  <p className="text-3xl font-bold text-primary mb-1">{docData.format.toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Format</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
