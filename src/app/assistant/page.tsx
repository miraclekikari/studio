
"use client"

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Sparkles, MessageSquare, FileSearch, Lightbulb, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AssistantPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-4 bg-primary/10 rounded-[2rem] text-primary mb-4">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Votre Assistant Personnel</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Optimisez votre lecture, analysez vos documents et trouvez des réponses instantanées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <FileSearch className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-headline font-bold mb-3">Synthèse Rapide</h3>
              <p className="text-slate-500 mb-6">Transformez des documents complexes en résumés clairs et exploitables en un clic.</p>
              <Button className="rounded-full w-full justify-between h-12">
                Commencer <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <MessageSquare className="w-12 h-12 text-secondary mb-6" />
              <h3 className="text-2xl font-headline font-bold mb-3">Dialogue Contextuel</h3>
              <p className="text-slate-500 mb-6">Posez des questions à vos fichiers et obtenez des réponses précises basées sur leur contenu.</p>
              <Button variant="outline" className="rounded-full w-full justify-between h-12 border-slate-200">
                Lancer le chat <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-headline font-bold">Suggestions d'utilisation</h2>
          </div>
          
          <ul className="space-y-4">
            {[
              "Explique-moi les concepts clés de ce rapport annuel.",
              "Vérifie la validité des arguments dans ce document juridique.",
              "Crée un questionnaire de révision basé sur ce cours.",
              "Traduire et adapter ce document technique."
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">{i+1}</span>
                <span className="text-slate-600 font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
