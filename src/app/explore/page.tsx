"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, BookOpen, Brain, Globe, Sparkles, Loader2, Filter } from 'lucide-react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { getLatestDocuments, type Document } from '@/lib/db'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'

const categories = [
  { name: "Tous", icon: Globe, color: "text-slate-500", bg: "bg-slate-50" },
  { name: "Savoirs", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Science", icon: Brain, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Tendances", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
]

function ExploreContent() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const searchParams = useSearchParams()
  const q = searchParams.get('q')
  const [searchQuery, setSearchQuery] = useState(q || "")
  const { toast } = useToast()

  useEffect(() => {
    fetchDocs()
  }, [selectedCategory])

  useEffect(() => {
    if (q) {
      setSearchQuery(q)
      handleSearchInternal(q)
    }
  }, [q])

  async function fetchDocs() {
    setLoading(true)
    try {
      const docs = await getLatestDocuments(24, selectedCategory)
      setDocuments(docs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchInternal = (query: string) => {
    if (!query.trim()) {
      fetchDocs()
      return
    }
    const filtered = documents.filter(d => 
      d.title.toLowerCase().includes(query.toLowerCase()) || 
      d.description.toLowerCase().includes(query.toLowerCase())
    )
    setDocuments(filtered)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearchInternal(searchQuery)
    toast({ title: "Recherche filtrée", description: `${documents.length} résultats potentiels` })
  }

  const handleShareView = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({ title: "Lien copié", description: "La vue actuelle peut être partagée." })
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-2xl mx-auto mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Découverte Intelligente</span>
        </div>
        <h1 className="text-5xl font-headline font-bold mb-8 tracking-tight text-slate-900">Explorez le Savoir</h1>
        
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Documents, thèmes, auteurs..." 
                className="pl-14 h-16 bg-white border-none rounded-2xl shadow-xl text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </div>
            <Button type="submit" size="icon" className="h-16 w-16 rounded-2xl shadow-xl">
              <Filter className="w-6 h-6" />
            </Button>
          </div>
        </form>
      </div>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-headline font-bold text-slate-800">Thématiques</h2>
          <Button variant="ghost" onClick={handleShareView} className="text-primary font-bold hover:bg-primary/5 rounded-full">Partager la vue</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Button 
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              variant="outline" 
              className={cn(
                "h-32 flex-col gap-4 rounded-[2.5rem] border-none shadow-sm transition-all duration-500 hover:scale-105 active:scale-95",
                selectedCategory === cat.name ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white hover:bg-slate-50"
              )}
            >
              <div className={cn("p-3 rounded-2xl", selectedCategory === cat.name ? "bg-white/20" : cat.bg)}>
                <cat.icon className={cn("w-6 h-6", selectedCategory === cat.name ? "text-white" : cat.color)} />
              </div>
              <span className="font-bold text-lg">{cat.name}</span>
            </Button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-12 border-b pb-8 border-slate-100">
          <h2 className="text-3xl font-headline font-bold text-slate-900">
            Résultats : <span className="text-primary">{selectedCategory}</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{documents.length} ressources</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6 opacity-20" />
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Mise à jour du flux...</p>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {documents.map((doc) => (
              <DocumentCard 
                key={doc.id}
                id={doc.id}
                title={doc.title}
                author={doc.profiles?.username || doc.profiles?.full_name || 'Anonyme'}
                authorAvatar={doc.profiles?.avatar_url}
                thumbnail={doc.thumbnail_url}
                file_url={doc.file_url}
                views={doc.views}
                likes={doc.likes}
                type={doc.format}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Globe className="w-10 h-10 text-slate-200" />
             </div>
             <p className="text-slate-400 font-medium italic text-lg">Aucun contenu trouvé dans cette catégorie.</p>
             <Button variant="link" onClick={() => setSelectedCategory("Tous")} className="mt-4 font-bold">Voir tout le catalogue</Button>
          </div>
        )}
      </section>
    </main>
  )
}

export default function ExplorePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }>
        <ExploreContent />
      </Suspense>
    </div>
  )
}