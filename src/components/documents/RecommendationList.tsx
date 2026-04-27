
"use client"

import React, { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Loader2, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { personalizedDocumentRecommendations, type PersonalizedDocumentRecommendationsOutput } from '@/ai/flows/personalized-document-recommendations'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { getLatestDocuments, getOrCreateProfile } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export function RecommendationList() {
  const [recommendations, setRecommendations] = useState<PersonalizedDocumentRecommendationsOutput['recommendations']>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
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

        const { data: { user } } = await supabase.auth.getUser()
        let userInterests = ["Technologie", "IA", "Design"]

        if (user) {
          const profile = await getOrCreateProfile(user.id, {})
          userInterests = profile?.interests || userInterests
        }

        const result = await personalizedDocumentRecommendations({
          userInterests,
          browsingHistoryDocumentTitles: [],
          uploadedDocumentTitles: [],
          availableDocuments: availableDocs
        })

        setRecommendations(result.recommendations)
      } catch (err) {
        console.error("Failed to fetch recommendations:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-xl mb-12">
      <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
      <span className="text-sm font-bold text-slate-400 mt-4 uppercase tracking-widest">IA en cours...</span>
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
            <p className="text-sm text-slate-500 font-medium">Basé sur vos intérêts</p>
          </div>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex gap-8">
          {recommendations.map((rec) => (
            <Link key={rec.documentId} href={`/document/${rec.documentId}`} className="w-[320px] shrink-0 block group">
              <Card className="bg-white border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden h-full border border-slate-50">
                <CardContent className="p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4">
                    <Sparkle className="w-3 h-3 text-primary animate-spin-slow" />
                    <span className="text-[10px] font-black text-primary uppercase">IA Recommend</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl mb-3 whitespace-normal line-clamp-2 text-slate-900">
                    {rec.title}
                  </h3>
                  <p className="text-xs italic text-slate-400 whitespace-normal leading-relaxed">
                    "{rec.reasons}"
                  </p>
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
