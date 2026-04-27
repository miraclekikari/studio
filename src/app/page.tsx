
"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { RecommendationList } from '@/components/documents/RecommendationList'
import { UploadDocument } from '@/components/documents/UploadDocument'
import { Button } from '@/components/ui/button'
import { Filter, TrendingUp, Clock, Star, Library, Loader2, Sparkles } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getLatestDocuments, type Document } from '@/lib/db'

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      try {
        const docs = await getLatestDocuments()
        setDocuments(docs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-16 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 rounded-[2.5rem] border shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,165,222,0.1),transparent)]" />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 p-8 md:p-16">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Nouveau : IA Document tagging</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-headline font-bold text-slate-900 leading-[1.1] tracking-tight">
                Le savoir est <br /><span className="text-primary italic">mieux partagé.</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                Découvrez, partagez et analysez vos documents avec la puissance de l'IA et de Supabase.
              </p>
              
              <div className="pt-6 flex flex-wrap gap-4 justify-center lg:justify-start">
                <UploadDocument />
                <Button variant="outline" size="lg" className="rounded-full px-10 border-slate-200 bg-white shadow-sm hover:bg-slate-50">
                  Parcourir
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg hidden lg:block">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                  <img 
                    src="https://picsum.photos/seed/community/800/600" 
                    alt="LibreShare Community" 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecommendationList />

        {/* Discovery Feed */}
        <section className="mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b pb-6">
            <div>
              <h2 className="text-4xl font-headline font-bold text-slate-900">Bibliothèque Globale</h2>
              <p className="text-slate-500 mt-2 text-lg">Contenus récents de la communauté.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="rounded-full gap-2 border-slate-200 bg-white">
                <Filter className="w-4 h-4" />
                Trier
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-slate-400 font-medium">Récupération des données Supabase...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {documents.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  id={doc.id}
                  title={doc.title}
                  author={doc.profiles?.full_name || 'Utilisateur'}
                  authorAvatar={doc.profiles?.avatar_url}
                  thumbnail={doc.thumbnail_url}
                  tags={[doc.category, doc.format.toUpperCase()]}
                  views={doc.views}
                  likes={doc.likes}
                  type={doc.format}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
              <Library className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800">Aucun document</h3>
              <p className="text-slate-500 mt-2">Partagez votre premier document Supabase dès maintenant.</p>
              <div className="mt-8">
                <UploadDocument />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
