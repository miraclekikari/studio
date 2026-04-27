"use client"

import React from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { saveDocument } from '@/lib/db'
import { auth } from '@/firebase/config'

export function UploadDocument() {
  const { toast } = useToast()

  return (
    <CldUploadWidget 
      uploadPreset="ml_default" 
      onSuccess={async (results) => {
        const info = results.info as any
        const user = auth.currentUser

        try {
          await saveDocument({
            title: info.original_filename,
            description: "Document partagé via LibreShare",
            fileUrl: info.secure_url,
            thumbnailUrl: info.thumbnail_url || `https://placehold.co/400x600?text=${info.original_filename}`,
            category: "Général",
            userId: user?.uid || "anonymous",
            userName: user?.displayName || "Utilisateur",
            userAvatar: user?.photoURL || "",
            format: info.format || "pdf"
          })

          toast({
            title: "Succès ! 🚀",
            description: "Votre document est maintenant en ligne.",
          })
          
          // Recharger pour voir le nouveau doc (ou gérer via un état global)
          window.location.reload()
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible d'enregistrer les données du document.",
          })
        }
      }}
    >
      {({ open }) => (
        <Button 
          onClick={() => open()}
          size="lg"
          className="rounded-full px-8 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-xl transition-all hover:scale-105 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="font-bold">Partager un Savoir</span>
          <Sparkles className="w-4 h-4 text-yellow-300 ml-1 animate-pulse" />
        </Button>
      )}
    </CldUploadWidget>
  )
}