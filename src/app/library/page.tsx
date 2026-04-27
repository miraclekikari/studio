
"use client"

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Library, Plus, Search, Filter, List, Grid2X2, MoreVertical, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentCard } from '@/components/documents/DocumentCard'

export default function LibraryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">My Library</h1>
            <p className="text-muted-foreground mt-2">Manage your uploaded documents and saved content.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button className="rounded-full px-6 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-white shadow-sm border w-full md:w-auto">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="uploads">My Uploads</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="shared">Shared with me</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Filter library..." className="pl-9 h-9 w-full md:w-64 bg-white" />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 border bg-white"><List className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 border bg-white"><Grid2X2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <DocumentCard 
                id="4" 
                title="Business Strategy for Solo Founders" 
                author="Sarah Jenkins" 
                thumbnail="https://picsum.photos/seed/doc4/400/600" 
                tags={["Entrepreneurship", "Strategy"]} 
                views={3400} 
                likes={890} 
                type="pdf" 
              />
              {/* Empty state simulation for other types if needed */}
              <div className="col-span-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-headline font-bold text-slate-600">New Document</h3>
                <p className="text-sm text-slate-400 mt-2">Upload a new file to your library</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="uploads">
             <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
               <Library className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <h3 className="text-xl font-headline font-bold">No uploads yet</h3>
               <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Start sharing your knowledge by uploading your first document to the community.</p>
               <Button className="mt-6 rounded-full px-8">Upload Now</Button>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
