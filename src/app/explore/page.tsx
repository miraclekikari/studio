
"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, BookOpen, Brain, Globe, Shield } from 'lucide-react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { getLatestDocuments, type Document } from '@/lib/db'

const categories = [
  { name: "Tendances", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Savoirs", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Science", icon: Brain, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Monde", icon: Globe, color: "text-green-500", bg: "bg-green-50" },
]

export default function ExplorePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLatestDocuments(12).then(docs => {
      setDocuments(docs)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-headline font-bold text-center mb-8">Explorer la Bibliothèque</h1>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Rechercher un document, un auteur ou un sujet..." 
                className="pl-12 h-14 bg-white border-none rounded-2xl shadow-xl text-lg focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-xl font-headline font-bold mb-6">Parcourir par thèmes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Button 
                key={cat.name}
                variant="outline" 
                className={cn(
                  "h-32 flex-col gap-3 rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all",
                  cat.bg
                )}
              >
                <cat.icon className={cn("w-8 h-8", cat.color)} />
                <span className="font-bold text-slate-700">{cat.name}</span>
              </Button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold">Découvertes du moment</h2>
            <Button variant="link" className="text-primary font-bold">Tout voir</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {documents.map((doc) => (
              <DocumentCard 
                key={doc.id}
                {...doc}
                author={doc.profiles?.full_name || 'Anonyme'}
                thumbnail={doc.thumbnail_url}
                tags={[doc.format.toUpperCase()]}
                type={doc.format}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

import { cn } from '@/lib/utils'
