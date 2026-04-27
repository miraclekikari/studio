"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Library, Plus, Search, List, Grid2X2, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { UploadDocument } from '@/components/documents/UploadDocument'
import { getUserDocuments, type DocumentData } from '@/lib/db'
import { auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

export default function LibraryPage() {
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        fetchUserDocs(user.uid)
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
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
            <p className="text-slate-500 mt-3 text-lg">Gérez vos savoirs partagés et vos favoris.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <UploadDocument />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-1 bg-white/50 backdrop-blur rounded-2xl border shadow-sm">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-6">Tous</TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-6">Mes Uploads</TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-6">Favoris</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher dans ma liste..." className="pl-10 h-10 w-full md:w-64 bg-white border-none shadow-inner" />
              </div>
              <div className="flex border rounded-xl overflow-hidden bg-white">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-r"><List className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none bg-slate-50"><Grid2X2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-slate-400">Chargement de votre bibliothèque...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {documents.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    id={doc.id!}
                    title={doc.title}
                    author={doc.userName}
                    thumbnail={doc.thumbnailUrl}
                    tags={[doc.category, doc.format.toUpperCase()]}
                    views={doc.views}
                    likes={doc.likes}
                    type={doc.format}
                  />
                ))}
                <div className="col-span-1 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-primary/50 transition-all hover:bg-white/50">
                  <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-headline font-bold text-slate-600">Nouveau Savoir</h3>
                  <p className="text-sm text-slate-400 mt-2">Ajoutez un fichier à votre bibliothèque</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                <Library className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-headline font-bold text-slate-800">Votre bibliothèque est vide</h3>
                <p className="text-slate-500 mt-3 max-w-md mx-auto">Commencez par partager votre premier document pour enrichir la communauté.</p>
                <div className="mt-10">
                  <UploadDocument />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="uploads">
             {/* Similaire au contenu "all" filtré ou un message spécifique */}
             <div className="text-center py-20 bg-white rounded-[2.5rem] border shadow-sm">
               <p className="text-slate-500">Ici s'afficheront uniquement les documents que vous avez mis en ligne.</p>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
