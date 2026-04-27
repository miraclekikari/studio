"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Library, Search, List, LayoutGrid, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { UploadDocument } from '@/components/documents/UploadDocument'
import { getUserDocuments, type Document } from '@/lib/db'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function LibraryPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        fetchUserDocs(session.user.id)
      } else {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchUserDocs(session.user.id)
      } else {
        setUserId(null)
        setDocuments([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserDocs(uid: string) {
    try {
      const docs = await getUserDocuments(uid)
      setDocuments(docs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-headline font-bold text-slate-900 tracking-tight">Ma Bibliothèque</h1>
            <p className="text-slate-500 mt-3 text-lg">Gérez vos savoirs partagés.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <UploadDocument />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-1 bg-white/50 backdrop-blur rounded-2xl border shadow-sm">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-6 font-bold">Tous</TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-6 font-bold">Mes Publications</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher..." className="pl-10 h-10 w-full md:w-64 bg-white border-none shadow-inner rounded-xl" />
              </div>
              <div className="flex border rounded-xl overflow-hidden bg-white shadow-sm">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-r"><List className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none bg-slate-50"><LayoutGrid className="w-4 h-4 text-primary" /></Button>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mise à jour...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {documents.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    id={doc.id}
                    title={doc.title}
                    author={userId === doc.user_id ? "Moi" : (doc.profiles?.username || "Auteur")}
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
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                <Library className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-headline font-bold text-slate-800">Votre bibliothèque est vide</h3>
                <p className="text-slate-500 mt-3 max-w-md mx-auto font-medium">Commencez par partager votre premier savoir avec la communauté.</p>
                <div className="mt-10">
                  <UploadDocument />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}