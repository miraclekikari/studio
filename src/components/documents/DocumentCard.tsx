
"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, Download, Eye, Heart, Share2 } from 'lucide-react'
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
    <Card className="group overflow-hidden flex flex-col h-full border-none shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="p-0 relative aspect-[4/5] overflow-hidden">
        <Image 
          src={thumbnail} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint="document thumbnail"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" asChild>
            <Link href={`/document/${id}`}>
              <Eye className="w-5 h-5" />
            </Link>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
            <Download className="w-5 h-5" />
          </Button>
        </div>
        <Badge className="absolute top-2 left-2 bg-primary/90 hover:bg-primary font-headline">
          {type.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <Link href={`/document/${id}`} className="block mb-2">
          <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground font-medium">{author}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-muted/50 mt-auto">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <Heart className="w-3.5 h-3.5" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>{views}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
