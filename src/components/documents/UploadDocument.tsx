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
      options={{
        cloudName: "dslxm58ng",
        maxFiles: 1,
        clientAllowedFormats: ["pdf", "png", "jpg", "jpeg", "docx"],
      }}
      onSuccess={async (results) => {
        const info = results.info as any
        const user = auth.currentUser
        setIsProcessing(true)

        try {
          let aiTags: string[] = []
          try {
            const tagResult = await automatedDocumentTagging({ 
              documentContent: `Document title: ${info.original_filename}. File format: ${info.format}.` 
            })
            aiTags = tagResult.tags
          } catch (e) {
            aiTags = ["Général"]
          }

          await saveDocument({
            title: info.original_filename,
            description: "Document partagé sur LibreShare.",
            fileUrl: info.secure_url,
            thumbnailUrl: info.thumbnail_url || `https://placehold.co/400x600?text=${info.original_filename}`,
            category: "Général",
            userId: user?.uid || "anonymous",
            userName: user?.displayName || "Anonyme",
            userAvatar: user?.photoURL || "",
            format: info.format || "pdf",
            tags: aiTags
          })

          toast({ title: "Document partagé !", description: "L'IA a analysé votre contenu." })
          window.location.reload()
        } catch (error) {
          toast({ variant: "destructive", title: "Erreur", description: "Échec de la sauvegarde." })
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
          className="rounded-full px-8 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-xl transition-all hover:scale-105"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          <span className="font-bold">{isProcessing ? "Analyse..." : "Partager"}</span>
        </Button>
      )}
    </CldUploadWidget>
  )
}