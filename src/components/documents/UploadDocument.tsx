"use client"

import React from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { saveDocument } from '@/lib/db'
import { auth } from '@/firebase/config'
import { automatedDocumentTagging } from '@/ai/flows/automated-document-tagging'

export function UploadDocument() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = React.useState(false)

  return (
    <CldUploadWidget 
      uploadPreset="ml_default" 
      onSuccess={async (results) => {
        const info = results.info as any
        const user = auth.currentUser
        setIsProcessing(true)

        try {
          // Utilisation de l'IA pour suggérer des tags basés sur le nom du fichier
          // (Idéalement on passerait le contenu, mais ici on simule avec le titre)
          let aiTags: string[] = []
          try {
            const tagResult = await automatedDocumentTagging({ 
              documentContent: `Document title: ${info.original_filename}. Description: Shared on LibreShare.` 
            })
            aiTags = tagResult.tags
          } catch (e) {
            console.error("AI tagging failed", e)
          }

          await saveDocument({
            title: info.original_filename,
            description: "Document partagé via LibreShare",
            fileUrl: info.secure_url,
            thumbnailUrl: info.thumbnail_url || `https://placehold.co/400x600?text=${info.original_filename}`,
            category: "Général",
            userId: user?.uid || "anonymous",
            userName: user?.displayName || "Utilisateur",
            userAvatar: user?.photoURL || "",
            format: info.format || "pdf",
            tags: aiTags
          })

          toast({
            title: "Succès ! 🚀",
            description: "Votre document est en ligne et a été analysé par l'IA.",
          })
          
          window.location.reload()
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible d'enregistrer les données du document.",
          })
        } finally {
          setIsProcessing(false)
        }
      }}
    >
      {({ open }) => (
        <Button 
          onClick={() => open()}
          size="lg"
          disabled={isProcessing}
          className="rounded-full px-8 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-xl transition-all hover:scale-105 group"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          )}
          <span className="font-bold">{isProcessing ? "Traitement IA..." : "Partager un Savoir"}</span>
          {!isProcessing && <Sparkles className="w-4 h-4 text-yellow-300 ml-1 animate-pulse" />}
        </Button>
      )}
    </CldUploadWidget>
  )
}
