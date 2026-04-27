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
  UserPlus,
  MessageSquare,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { summarizeDocument } from '@/ai/flows/ai-document-summarization-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { getDocumentById, type DocumentData } from '@/lib/db'

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
      const data = await getDocumentById(id)
      if (data) {
        setDocData(data)
      } else {
        // Optionnel: redirection ou message d'erreur
      }
      setLoading(false)
    }
    fetchDoc()
  }, [id])

  const handleSummarize = async () => {
    if (!docData) return
    setSummarizing(true)
    try {
      // Pour la démo, on utilise la description si le contenu est trop court ou absent
      const content = docData.description || "Contenu du document à résumer."
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
          <p className="text-slate-500 font-medium">Chargement du document...</p>
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
          <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 group">
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Retour à la bibliothèque
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border overflow-hidden">
              <div className="aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden">
                {docData.thumbnailUrl ? (
                  <img src={docData.thumbnailUrl} alt={docData.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Aperçu indisponible</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h1 className="text-3xl font-headline font-bold mb-4">{docData.title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={docData.userAvatar || `https://picsum.photos/seed/${docData.userId}/100/100`} />
                    <AvatarFallback>{docData.userName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{docData.userName}</p>
                    <p className="text-xs text-muted-foreground">Publié récemment</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Heart className="w-4 h-4" /> {docData.likes}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Share2 className="w-4 h-4" /> Partager
                  </Button>
                  <Button size="sm" className="rounded-full gap-2" asChild>
                    <a href={docData.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </Button>
                </div>
              </div>

              <h2 className="text-lg font-headline font-bold mb-3">À propos de ce document</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {docData.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-3 py-1 font-medium">#{docData.category}</Badge>
                {docData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 font-medium">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24" />
              </div>
              
              <h3 className="text-xl font-headline font-bold flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                Assistant IA
              </h3>
              
              {!summary && !summarizing ? (
                <>
                  <p className="text-sm opacity-90 mb-6 leading-relaxed">
                    Besoin d'un aperçu rapide ? Notre IA peut générer un résumé concis instantanément.
                  </p>
                  <Button 
                    onClick={handleSummarize}
                    variant="secondary" 
                    className="w-full bg-white text-secondary hover:bg-white/90 border-none font-bold"
                  >
                    Résumer le document
                  </Button>
                </>
              ) : summarizing ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full bg-white/20" />
                  <Skeleton className="h-4 w-[90%] bg-white/20" />
                  <Skeleton className="h-4 w-[80%] bg-white/20" />
                  <p className="text-xs text-center animate-pulse opacity-70">Synthèse en cours...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed italic">
                    {summary}
                  </p>
                  <Button 
                    onClick={() => setSummary(null)}
                    variant="link" 
                    className="text-white/70 p-0 h-auto text-xs"
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-headline font-bold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">{docData.views}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Vues</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">{docData.format.toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Format</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
