
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
        let userInterests = ["Technologie", "Design", "Savoir"]

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
        console.error("Recommendations error:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-sm mb-12">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  )

  if (recommendations.length === 0) return null

  return (
    <section className="mb-24">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-[1.5rem] shadow-xl shadow-primary/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Sélectionné pour vous</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Basé sur vos préférences</p>
          </div>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-8">
        <div className="flex gap-10">
          {recommendations.map((rec) => (
            <Link key={rec.documentId} href={`/document/${rec.documentId}`} className="w-[340px] shrink-0 block group">
              <Card className="bg-white border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden h-full border border-slate-50">
                <CardContent className="p-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full mb-6">
                    <Sparkle className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Suggéré</span>
                  </div>
                  <h3 className="font-headline font-bold text-2xl mb-4 whitespace-normal line-clamp-2 text-slate-900 leading-tight group-hover:text-primary transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-400 whitespace-normal leading-relaxed italic opacity-80">
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
