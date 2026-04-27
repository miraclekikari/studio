"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, Download, Eye, Heart, Share2, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DocumentCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail: string;
  tags: string[];
  views: number;
  likes: number;
  type: string;
}

export function DocumentCard({ id, title, author, authorAvatar, thumbnail, tags, views, likes, type }: DocumentCardProps) {
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
        
        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center gap-4">
          <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 shadow-2xl hover:scale-110 transition-transform" asChild>
            <Link href={`/document/${id}`}>
              <Eye className="w-6 h-6" />
            </Link>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full w-12 h-12 shadow-2xl hover:scale-110 transition-transform">
            <Download className="w-6 h-6" />
          </Button>
        </div>

        {/* Badge Type */}
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
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{author[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-500 font-semibold">{author}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-slate-50/50 border-t flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400">
          <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group/like">
            <Heart className="w-4 h-4 group-hover/like:fill-current" />
            <span className="text-xs font-bold">{likes}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold">{views}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}