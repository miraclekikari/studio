
"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, BookOpen, Brain, Globe, Shield, Sparkles, Loader2 } from 'lucide-react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { getLatestDocuments, type Document } from '@/lib/db'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const categories = [
  { name: "Tous", icon: Globe, color: "text-slate-500", bg: "bg-slate-50" },
  { name: "Tendances", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Savoirs", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Science", icon: Brain, color: "text-purple-500", bg: "bg-purple-50" },
]

export default function ExplorePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const { toast } = useToast()

  useEffect(() => {
    fetchDocs()
  }, [selectedCategory])

  async function fetchDocs() {
    setLoading(true)
    try {
      const docs = await getLatestDocuments(20, selectedCategory)
      setDocuments(docs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleShareSearch = () => {
    toast({ title: "Partage actif", description: "Lien de recherche copié !" })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-4xl font-headline font-bold text-center">Découverte</h1>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[1.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-300"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <Input 
                placeholder="Documents, auteurs, sujets..." 
                className="pl-14 h-16 bg-white border-none rounded-[1.5rem] shadow-xl text-lg focus-visible:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && toast({ title: "Recherche lancée" })}
              />
            </div>
          </div>
        </div>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-headline font-bold">Thématiques</h2>
            <Button variant="ghost" onClick={handleShareSearch} className="text-primary font-bold">Partager la vue</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Button 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                variant="outline" 
                className={cn(
                  "h-32 flex-col gap-3 rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 group",
                  selectedCategory === cat.name ? "bg-primary text-white" : cat.bg
                )}
              >
                <cat.icon className={cn("w-8 h-8 transition-transform group-hover:scale-110", selectedCategory === cat.name ? "text-white" : cat.color)} />
                <span className="font-bold text-lg">{cat.name}</span>
              </Button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-10 border-b pb-6 border-slate-100">
            <h2 className="text-3xl font-headline font-bold text-slate-900">À l'affiche : <span className="text-primary">{selectedCategory}</span></h2>
            <Button variant="outline" className="rounded-full px-8 bg-white border-slate-200">Filtrer</Button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Analyse du flux...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {documents.map((doc) => (
                <DocumentCard 
                  key={doc.id}
                  {...doc}
                  author={doc.profiles?.username || doc.profiles?.full_name || 'Anonyme'}
                  thumbnail={doc.thumbnail_url}
                  tags={doc.tags || [doc.format.toUpperCase()]}
                  type={doc.format}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <p className="text-slate-500 font-medium italic">Aucun document pour cette catégorie.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
