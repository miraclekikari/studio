
"use client"

import React from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { saveDocument } from '@/lib/db'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function UploadDocument() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleUploadSuccess = async (results: any) => {
    const info = results.info as any
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({ variant: "destructive", title: "Non connecté", description: "Veuillez vous connecter pour publier votre savoir." })
      return
    }

    setIsProcessing(true)

    try {
      const file_url = info.secure_url;
      const thumbnail_url = info.thumbnail_url || `https://placehold.co/400x600?text=${encodeURIComponent(info.original_filename || 'Doc')}`;

      await saveDocument({
        title: info.original_filename || "Document sans titre",
        description: "Partagé via l'Expertise Studio.",
        file_url: file_url,
        thumbnail_url: thumbnail_url,
        category: "Savoirs",
        user_id: user.id,
        format: info.format || "pdf"
      })

      toast({ title: "Savoir publié !", description: "Votre document est maintenant accessible à la communauté." })
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error: any) {
      console.error("Upload save error:", error)
      toast({ 
        variant: "destructive", 
        title: "Erreur d'enregistrement", 
        description: "Le système n'a pas pu indexer votre document. Vérifiez votre connexion." 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <CldUploadWidget 
      uploadPreset="studio_unsigned"
      options={{
        cloudName: "dslxm58ng",
        maxFiles: 1,
        clientAllowedFormats: ["pdf", "png", "jpg", "jpeg", "docx"],
        resourceType: "auto",
        folder: "samples/ecommerce"
      }}
      onSuccess={handleUploadSuccess}
    >
      {({ open }) => (
        <Button 
          onClick={() => isSupabaseConfigured ? open() : toast({ title: "Configuration manquante", description: "Vérifiez vos clés Supabase et Cloudinary.", variant: "destructive" })}
          size="lg"
          disabled={isProcessing}
          className="rounded-full px-8 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-14"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          <span className="font-bold text-lg">{isProcessing ? "Indexation..." : "Publier"}</span>
        </Button>
      )}
    </CldUploadWidget>
  )
}
