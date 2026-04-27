"use client"

import React, { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Loader2, Sparkle } from 'lucide-react'
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
        
        if (allDocs.length === 0) {
          setLoading(false)
          return
        }

        const availableDocs = allDocs.map(d => ({
          id: d.id || "",
          title: d.title,
          description: d.description,
          tags: d.tags || []
        }))

        let userInterests = ["Technologie", "IA", "Design"]
        let userDocsTitles: string[] = []

        if (user) {
          const profile = await getOrCreateProfile(user.uid, {})
          userInterests = profile.interests || userInterests
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
    <div className="h-64 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-xl mb-12">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <span className="text-sm font-bold text-slate-400 mt-4 uppercase tracking-widest">L'IA personnalise votre flux...</span>
    </div>
  )

  if (recommendations.length === 0) return null

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-[1.25rem] shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Sélectionné pour vous</h2>
            <p className="text-sm text-slate-500 font-medium">Analyse prédictive basée sur vos centres d'intérêt</p>
          </div>
        </div>
        <Button variant="ghost" className="text-primary hover:text-primary/80 group rounded-full font-bold px-6 bg-primary/5">
          Explorer plus <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex gap-8">
          {recommendations.map((rec) => (
            <Link key={rec.documentId} href={`/document/${rec.documentId}`} className="w-[380px] shrink-0 block group">
              <Card className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:-translate-y-3 rounded-[2.5rem] overflow-hidden h-full border border-slate-50">
                <CardContent className="p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full">
                      <Sparkle className="w-3 h-3 text-primary animate-spin-slow" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Optimisation IA</span>
                    </div>
                  </div>
                  <h3 className="font-headline font-bold text-2xl mb-4 whitespace-normal group-hover:text-primary transition-colors line-clamp-2 leading-tight text-slate-900">
                    {rec.title}
                  </h3>
                  <p className="text-base text-slate-500 mb-8 line-clamp-2 whitespace-normal leading-relaxed font-medium">
                    {rec.description}
                  </p>
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                    <p className="text-xs italic text-slate-400 whitespace-normal pl-4 leading-relaxed">
                      "{rec.reasons}"
                    </p>
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