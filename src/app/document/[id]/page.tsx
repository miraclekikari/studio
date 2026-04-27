
"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Share2, 
  Heart, 
  Eye, 
  Sparkles, 
  ChevronLeft, 
  FileText,
  UserPlus,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { summarizeDocument } from '@/ai/flows/ai-document-summarization-flow'
import { Skeleton } from '@/components/ui/skeleton'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [summary, setSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  
  // Mock document data
  const doc = {
    title: "Mastering React 19: Server Components & Beyond",
    author: "Elena Rodriguez",
    date: "March 15, 2024",
    description: "This comprehensive guide explores the latest features in React 19, focusing on Server Components, Actions, and the new compiler. Perfect for senior developers looking to upgrade their skillset.",
    tags: ["React", "WebDev", "Tech", "JavaScript", "NextJS"],
    views: 1240,
    likes: 342,
    type: "pdf",
    contentPreview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum..."
  }

  const handleSummarize = async () => {
    setSummarizing(true)
    try {
      const result = await summarizeDocument({ documentContent: doc.contentPreview })
      setSummary(result.summary)
    } catch (err) {
      console.error(err)
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 group">
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Viewer Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border overflow-hidden">
              <div className="aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
                <div className="text-center p-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">In-App Document Viewer Preview</p>
                  <p className="text-xs text-slate-400 mt-2">Integrating PDF.js / Cloudinary Reader</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h1 className="text-3xl font-headline font-bold mb-4">{doc.title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://picsum.photos/seed/user2/100/100" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{doc.author}</p>
                    <p className="text-xs text-muted-foreground">Published on {doc.date}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-2 rounded-full h-8 text-xs">
                    <UserPlus className="w-3 h-3 mr-1" /> Follow
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Heart className="w-4 h-4" /> {doc.likes}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <Button size="sm" className="rounded-full gap-2">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
              </div>

              <h2 className="text-lg font-headline font-bold mb-3">About this document</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {doc.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {doc.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 font-medium">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24" />
              </div>
              
              <h3 className="text-xl font-headline font-bold flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                AI Assistant
              </h3>
              
              {!summary && !summarizing ? (
                <>
                  <p className="text-sm opacity-90 mb-6 leading-relaxed">
                    Need a quick overview? Our AI can generate a concise summary of this document instantly.
                  </p>
                  <Button 
                    onClick={handleSummarize}
                    variant="secondary" 
                    className="w-full bg-white text-secondary hover:bg-white/90 border-none font-bold"
                  >
                    Summarize Document
                  </Button>
                </>
              ) : summarizing ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full bg-white/20" />
                  <Skeleton className="h-4 w-[90%] bg-white/20" />
                  <Skeleton className="h-4 w-[80%] bg-white/20" />
                  <p className="text-xs text-center animate-pulse opacity-70">Synthesizing content...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed italic">
                    {summary}
                  </p>
                  <Button 
                    onClick={() => setSummary(null)}
                    variant="link" 
                    className="text-white/70 p-0 h-auto text-xs"
                  >
                    Reset summary
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-headline font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Community Thoughts
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src="https://picsum.photos/seed/user5/100/100" />
                  </Avatar>
                  <div className="bg-slate-50 rounded-lg p-3 flex-1">
                    <p className="text-xs font-bold mb-1">Sarah J.</p>
                    <p className="text-xs text-slate-600">Great resource! The section on Server Components is very well explained.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <textarea 
                  placeholder="Share your thoughts..." 
                  className="w-full text-sm bg-slate-50 border rounded-lg p-3 focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                />
                <Button size="sm" className="w-full">Post Comment</Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-headline font-bold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">{doc.views}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Views</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">12.4 MB</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Size</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">24</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pages</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">{doc.likes}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Hearts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
