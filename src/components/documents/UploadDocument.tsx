
"use client"

import React from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function UploadDocument() {
  const { toast } = useToast()

  return (
    <CldUploadWidget 
      uploadPreset="ml_default" // Remplacez par votre preset Cloudinary
      onSuccess={(results) => {
        const info = results.info as any
        console.log("Upload réussi:", info)
        
        toast({
          title: "Document partagé !",
          description: `Le fichier ${info.original_filename} est maintenant disponible pour la communauté.`,
        })
      }}
    >
      {({ open }) => (
        <Button 
          onClick={() => open()}
          className="rounded-full px-6 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Partager un Document</span>
        </Button>
      )}
    </CldUploadWidget>
  )
}
