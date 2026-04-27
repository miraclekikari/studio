
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Send, User, Bot, Loader2, Eraser, MessageSquare, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { chatWithAssistant } from '@/ai/flows/chat-flow'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Bonjour ! Je suis l\'Assistant Studio. Je peux vous aider à analyser vos documents, résumer des textes ou simplement répondre à vos questions sur le savoir partagé. Que puis-je faire pour vous ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollRef.current) {
      const scrollViewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTo({
          top: scrollViewport.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Nettoyage de l'historique pour ne passer que ce qui est nécessaire
      const history = messages.map(m => ({ role: m.role, content: m.content })).slice(-5)
      
      const result = await chatWithAssistant({
        message: userMessage,
        history
      })
      
      if (result && result.response) {
        setMessages(prev => [...prev, { role: 'model', content: result.response }])
      } else {
        throw new Error("Réponse vide de l'IA")
      }
    } catch (error) {
      console.error("AI Error:", error)
      toast({ title: "Erreur Assistant", description: "L'IA semble occupée. Réessayez dans un instant.", variant: "destructive" })
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, je rencontre une petite perturbation technique. Essayons encore une fois ?" }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([{ role: 'model', content: 'Conversation réinitialisée. Comment puis-je vous aider ?' }])
    toast({ title: "Nettoyage terminé" })
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-slate-900">Assistant Studio</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Intelligence Active</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full border-slate-200 bg-white" onClick={() => toast({ title: "Nouvelle analyse" })}>
              <Plus className="w-4 h-4 mr-2" /> Nouveau
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 rounded-full"
            >
              <Eraser className="w-4 h-4 mr-2" /> Effacer
            </Button>
          </div>
        </div>

        <Card className="flex-1 bg-white rounded-[3rem] shadow-2xl border-none overflow-hidden flex flex-col relative mb-6">
          <ScrollArea className="flex-1 p-6 md:p-12" ref={scrollRef}>
            <div className="space-y-10">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-5 max-w-[90%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                    msg.role === 'user' ? "bg-white text-slate-400 border border-slate-100" : "bg-primary text-white"
                  )}>
                    {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                  <div className={cn(
                    "p-6 rounded-[2rem] text-sm md:text-lg leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-slate-50 text-slate-800 rounded-tr-none border border-slate-100" 
                      : "bg-primary/5 text-slate-900 rounded-tl-none border border-primary/10"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-5 mr-auto">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div className="p-6 rounded-[2rem] rounded-tl-none bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 md:p-10 bg-slate-50/50 border-t border-slate-100">
            <div className="relative max-w-3xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Demander une synthèse ou poser une question..."
                className="h-16 pl-8 pr-16 bg-white border-none shadow-2xl rounded-full text-lg focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-slate-300"
                disabled={loading}
              />
              <Button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg shadow-primary/30 transition-transform active:scale-95"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-slate-300 mt-6 font-bold uppercase tracking-[0.2em]">
              Intelligence Studio • Traitement sécurisé du savoir
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}
