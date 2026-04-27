
import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { RecommendationList } from '@/components/documents/RecommendationList'
import { Button } from '@/components/ui/button'
import { Filter, TrendingUp, Clock, Star, Library } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const MOCK_DOCUMENTS = [
  {
    id: "1",
    title: "Mastering React 19: Server Components & Beyond",
    author: "Elena Rodriguez",
    authorAvatar: "https://picsum.photos/seed/user2/100/100",
    thumbnail: "https://picsum.photos/seed/doc1/400/600",
    tags: ["React", "WebDev", "Tech"],
    views: 1240,
    likes: 342,
    type: "pdf"
  },
  {
    id: "2",
    title: "The Ultimate Guide to Healthy Mediterranean Cuisine",
    author: "Chef Marco",
    authorAvatar: "https://picsum.photos/seed/user3/100/100",
    thumbnail: "https://picsum.photos/seed/doc2/400/600",
    tags: ["Cooking", "Health", "Recipes"],
    views: 890,
    likes: 156,
    type: "epub"
  },
  {
    id: "3",
    title: "Sustainable Urban Design in 2025",
    author: "Julian Chen",
    authorAvatar: "https://picsum.photos/seed/user4/100/100",
    thumbnail: "https://picsum.photos/seed/doc3/400/600",
    tags: ["Architecture", "Sustainability", "Design"],
    views: 2100,
    likes: 567,
    type: "pdf"
  },
  {
    id: "4",
    title: "Business Strategy for Solo Founders",
    author: "Sarah Jenkins",
    authorAvatar: "https://picsum.photos/seed/user5/100/100",
    thumbnail: "https://picsum.photos/seed/doc4/400/600",
    tags: ["Entrepreneurship", "Strategy", "Business"],
    views: 3400,
    likes: 890,
    type: "pdf"
  },
  {
    id: "5",
    title: "The Psychology of User Interface Design",
    author: "David Varkey",
    authorAvatar: "https://picsum.photos/seed/user6/100/100",
    thumbnail: "https://picsum.photos/seed/doc5/400/600",
    tags: ["Psychology", "UI", "Design"],
    views: 1560,
    likes: 421,
    type: "pdf"
  },
  {
    id: "6",
    title: "Quantum Computing for Beginners",
    author: "Dr. Alice Smart",
    authorAvatar: "https://picsum.photos/seed/user7/100/100",
    thumbnail: "https://picsum.photos/seed/doc6/400/600",
    tags: ["Science", "Quantum", "Tech"],
    views: 540,
    likes: 98,
    type: "epub"
  }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero / Recommendation Section */}
        <RecommendationList />

        {/* Discovery Feed */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold text-slate-900">Discover Library</h2>
              <p className="text-muted-foreground mt-1">Browse shared knowledge from our global community.</p>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Tabs defaultValue="trending" className="w-auto">
                <TabsList className="bg-white shadow-sm border">
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Trending</span>
                  </TabsTrigger>
                  <TabsTrigger value="newest" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Newest</span>
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span className="hidden sm:inline">Top Rated</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" className="flex items-center gap-2 bg-white shadow-sm">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {MOCK_DOCUMENTS.map((doc) => (
              <DocumentCard key={doc.id} {...doc} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Load More Documents
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Library className="w-5 h-5 text-white" />
              </div>
              <span className="font-headline font-bold text-xl tracking-tight">LibreShare</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering knowledge sharing through a social, accessible document platform.
            </p>
          </div>
          
          <div>
            <h4 className="font-headline font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">How it works</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">PWA Mobile</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-headline font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-headline font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Get the latest documents in your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-muted px-3 py-2 rounded-md text-sm border-none focus:ring-1 focus:ring-primary outline-none" 
              />
              <Button size="sm">Join</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          © 2025 LibreShare Inc. All rights reserved. Built for knowledge.
        </div>
      </footer>
    </div>
  )
}
