"use client"

import React, { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { personalizedDocumentRecommendations, type PersonalizedDocumentRecommendationsOutput } from '@/ai/flows/personalized-document-recommendations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getLatestDocuments, getOrCreateProfile } from '@/lib/db'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

export function RecommendationList() {
  const [recommendations, setRecommendations] = useState<PersonalizedDocumentRecommendationsOutput['recommendations']>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const allDocs = await getLatestDocuments(30)
        
        // Formatter les docs pour l'IA
        const availableDocs = allDocs.map(d => ({
          id: d.id || "",
          title: d.title,
          description: d.description,
          tags: d.tags || []
        }))

        let userInterests = ["Technology", "AI", "Design"]
        let userDocsTitles: string[] = []

        if (user) {
          const profile = await getOrCreateProfile(user.uid, {})
          userInterests = profile.interests || userInterests
          // On pourrait aussi récupérer l'historique ici
        }

        const result = await personalizedDocumentRecommendations({
          userInterests,
          browsingHistoryDocumentTitles: [],
          uploadedDocumentTitles: userDocsTitles,
          availableDocuments: availableDocs
        })

        setRecommendations(result.recommendations)
      } catch (err) {
        console.error("Failed to fetch recommendations:", err)
      } finally {
        setLoading(false)
      }
    })
    
    return () => unsubscribe()
  }, [])

  if (loading) return (
    <div className="h-40 flex flex-col items-center justify-center bg-white/50 backdrop-blur rounded-[2rem] border border-dashed mb-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
      <span className="text-sm font-medium text-slate-500">L'IA prépare vos recommandations...</span>
    </div>
  )

  if (recommendations.length === 0) return null

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold text-slate-900">Spécialement pour vous</h2>
            <p className="text-sm text-slate-500">Basé sur vos intérêts et les tendances</p>
          </div>
        </div>
        <Button variant="ghost" className="text-primary hover:text-primary/80 group rounded-full font-bold">
          Tout voir <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex gap-6">
          {recommendations.map((rec) => (
            <Link key={rec.documentId} href={`/document/${rec.documentId}`} className="w-[320px] shrink-0 block group">
              <Card className="bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-2 rounded-[2rem] overflow-hidden h-full">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Match IA
                    </Badge>
                  </div>
                  <h3 className="font-headline font-bold text-xl mb-3 whitespace-normal group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 whitespace-normal leading-relaxed">
                    {rec.description}
                  </p>
                  <div className="text-xs italic text-slate-600 whitespace-normal bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{rec.reasons}"
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}
