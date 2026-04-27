
"use client"

import React, { useEffect, useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { personalizedDocumentRecommendations, type PersonalizedDocumentRecommendationsOutput } from '@/ai/flows/personalized-document-recommendations'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export function RecommendationList() {
  const [recommendations, setRecommendations] = useState<PersonalizedDocumentRecommendationsOutput['recommendations']>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecs() {
      try {
        const result = await personalizedDocumentRecommendations({
          userInterests: ["Technology", "AI", "Design"],
          browsingHistoryDocumentTitles: ["The Future of Web", "React 19 Deep Dive"],
          uploadedDocumentTitles: ["My Portfolio 2024"],
          availableDocuments: [
            {
              id: "rec-1",
              title: "Generative AI Strategies",
              description: "A comprehensive guide to leveraging GenAI in business.",
              tags: ["AI", "Strategy"]
            },
            {
              id: "rec-2",
              title: "Modern UI Patterns",
              description: "Exploring the best practices for interface design.",
              tags: ["Design", "UI"]
            },
            {
              id: "rec-3",
              title: "Next.js Performance",
              description: "Optimizing your Next.js applications for speed.",
              tags: ["Web", "Dev"]
            }
          ]
        })
        setRecommendations(result.recommendations)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecs()
  }, [])

  if (loading) return (
    <div className="h-32 flex items-center justify-center bg-muted/20 rounded-xl">
      <Sparkles className="w-5 h-5 animate-pulse text-primary mr-2" />
      <span className="text-sm font-medium">Finding recommendations...</span>
    </div>
  )

  if (recommendations.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">Personalized for you</h2>
            <p className="text-sm text-muted-foreground">Based on your interests and activity</p>
          </div>
        </div>
        <Button variant="ghost" className="text-primary hover:text-primary/80 group">
          View all <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex gap-4">
          {recommendations.map((rec) => (
            <Link key={rec.documentId} href={`/document/${rec.documentId}`} className="w-[300px] shrink-0 block group">
              <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Topic Match</Badge>
                  </div>
                  <h3 className="font-headline font-bold text-lg mb-2 whitespace-normal group-hover:text-primary transition-colors">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 whitespace-normal">{rec.description}</p>
                  <div className="text-xs italic text-muted-foreground whitespace-normal bg-muted/30 p-2 rounded">
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
