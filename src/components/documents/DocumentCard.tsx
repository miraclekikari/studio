"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Heart, Share2, Download } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { toggleLikeDocument } from '@/lib/db'
import { useToast } from '@/hooks/use-toast'

interface DocumentCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail: string;
  file_url?: string;
  views: number;
  likes: number;
  type: string;
}

export function DocumentCard({ id, title, author, authorAvatar, thumbnail, file_url, views, likes, type }: DocumentCardProps) {
  const { toast } = useToast()
  const [currentLikes, setCurrentLikes] = useState(likes)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour soutenir ce savoir.",
        variant: "destructive"
      })
      return
    }

    try {
      await toggleLikeDocument(id, userId)
      setCurrentLikes(prev => prev + 1)
      toast({ title: "Merci pour votre intérêt !" })
    } catch (error) {
      console.error(error)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/document/${id}`
    navigator.clipboard.writeText(url)
    toast({ title: "Lien copié !", description: "Le savoir est prêt à être partagé." })
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!file_url) {
        toast({ title: "Erreur", description: "Fichier source introuvable.", variant: "destructive" })
        return
    }
    toast({ title: "Téléchargement lancé", description: "Votre ressource arrive." })
  }

  return (
    <Card className="group flex flex-col h-full border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[2rem] overflow-hidden">
      <CardHeader className="p-0 relative aspect-[4/5] overflow-hidden">
        <Image 
          src={thumbnail} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint="document thumbnail"
        />
        
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center gap-4">
          <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 shadow-2xl hover:scale-110 transition-transform" asChild>
            <Link href={`/document/${id}`}>
              <Eye className="w-6 h-6" />
            </Link>
          </Button>
          {file_url && (
            <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 shadow-2xl hover:scale-110 transition-transform" onClick={handleDownload} asChild>
              <a href={file_url} target="_blank" rel="noopener noreferrer" download>
                <Download className="w-6 h-6" />
              </a>
            </Button>
          )}
        </div>

        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 backdrop-blur-md text-primary hover:bg-white border-none shadow-sm px-3 py-1 font-bold">
            {type.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col">
        <Link href={`/document/${id}`} className="block mb-4">
          <h3 className="font-headline font-bold text-xl leading-snug text-slate-800 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 ring-2 ring-primary/10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{author?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-500 font-semibold">{author}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary rounded-full" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            {file_url && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary rounded-full" asChild>
                    <a href={file_url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-4 h-4" />
                    </a>
                </Button>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-slate-50/50 border-t flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-colors hover:text-red-500"
          >
            <Heart className={currentLikes > likes ? "w-4 h-4 fill-red-500 text-red-500" : "w-4 h-4"} />
            <span className="text-xs font-bold">{currentLikes}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold">{views}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}