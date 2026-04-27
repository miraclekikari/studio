"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { RecommendationList } from '@/components/documents/RecommendationList'
import { UploadDocument } from '@/components/documents/UploadDocument'
import { Button } from '@/components/ui/button'
import { Filter, Library, Loader2 } from 'lucide-react'
import { getLatestDocuments, type Document } from '@/lib/db'

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLatestDocuments().then(docs => {
      setDocuments(docs)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-16 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 rounded-[3rem] border-none shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,165,222,0.1),transparent)]" />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 p-10 md:p-20">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-sm border border-slate-50">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Communauté Active</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-headline font-bold text-slate-900 leading-[1] tracking-tight">
                Libérez votre <br /><span className="text-primary italic">savoir.</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
                Découvrez, partagez et analysez vos documents dans l'espace de partage le plus moderne.
              </p>
              
              <div className="pt-4 flex flex-wrap gap-5 justify-center lg:justify-start">
                <UploadDocument />
                <Button variant="outline" size="lg" className="rounded-full px-12 border-slate-200 bg-white h-14 text-lg font-bold hover:bg-slate-50 shadow-sm" asChild>
                  <a href="/explore">Explorer</a>
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl hidden lg:block">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                    alt="Studio Experience" 
                    className="object-cover w-full h-full transform transition duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecommendationList />

        {/* Discovery Feed */}
        <section className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
            <div>
              <h2 className="text-4xl font-headline font-bold text-slate-900">À la une</h2>
              <p className="text-slate-500 mt-2 text-lg">Les documents les plus consultés récemment.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full gap-2 border-slate-200 bg-white px-6 font-bold" asChild>
                <a href="/explore"><Filter className="w-4 h-4" /> Filtrer</a>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="w-14 h-14 text-primary animate-spin opacity-20" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Chargement...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
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
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <Library className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800">Aucun contenu trouvé</h3>
              <p className="text-slate-500 mt-2 mb-10 font-medium">Soyez le premier à partager une ressource.</p>
              <UploadDocument />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}