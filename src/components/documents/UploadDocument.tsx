
"use client"

import React from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { saveDocument } from '@/lib/db'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { automatedDocumentTagging } from '@/ai/flows/automated-document-tagging'
import { useRouter } from 'next/navigation'

export function UploadDocument() {
  const { toast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleUploadSuccess = async (results: any) => {
    const info = results.info as any
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({ variant: "destructive", title: "Non connecté", description: "Veuillez vous connecter pour publier sur Supabase." })
      return
    }

    setIsProcessing(true)

    try {
      let aiTags: string[] = []
      try {
        const tagResult = await automatedDocumentTagging({ 
          documentContent: `Titre: ${info.original_filename}. Format: ${info.format}.` 
        })
        aiTags = tagResult.tags
      } catch (e) {
        aiTags = ["Général", info.format || "fichier"]
      }

      await saveDocument({
        title: info.original_filename || "Document sans titre",
        description: "Partagé via Cloudinary sur Supabase.",
        file_url: info.secure_url,
        thumbnail_url: info.thumbnail_url || `https://placehold.co/400x600?text=${info.original_filename}`,
        category: "Général",
        user_id: user.id,
        format: info.format || "pdf",
        tags: aiTags
      })

      toast({ title: "Document publié !", description: "Votre savoir est maintenant partagé sur Supabase." })
      router.refresh()
      window.location.reload()
    } catch (error) {
      console.error("Upload error:", error)
      toast({ variant: "destructive", title: "Erreur Supabase", description: "Impossible d'enregistrer le document." })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <CldUploadWidget 
      uploadPreset="ml_default"
      options={{
        cloudName: "dslxm58ng",
        maxFiles: 1,
        clientAllowedFormats: ["pdf", "png", "jpg", "jpeg", "docx"],
        resourceType: "auto",
      }}
      onSuccess={handleUploadSuccess}
    >
      {({ open }) => (
        <Button 
          onClick={() => isSupabaseConfigured ? open() : toast({ title: "Erreur", description: "Supabase n'est pas configuré.", variant: "destructive" })}
          size="lg"
          disabled={isProcessing}
          className="rounded-full px-8 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-xl"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          <span className="font-bold">{isProcessing ? "Publication..." : "Publier"}</span>
        </Button>
      )}
    </CldUploadWidget>
  )
}
