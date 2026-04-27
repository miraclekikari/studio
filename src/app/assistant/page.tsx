
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Send, User, Bot, Loader2, Eraser, Plus, MessageSquare } from 'lucide-react'
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
    { role: 'model', content: 'Bonjour ! Je suis l\'Assistant Studio. Je peux vous aider à explorer vos ressources ou répondre à vos questions complexes. Que souhaitez-vous approfondir ?' }
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
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      
      const result = await chatWithAssistant({
        message: userMessage,
        history
      })
      
      if (result && result.response) {
        setMessages(prev => [...prev, { role: 'model', content: result.response }])
      } else {
        throw new Error("Réponse vide")
      }
    } catch (error) {
      console.error("Assistant Communication Error:", error)
      toast({ title: "Accès différé", description: "Vérifiez la configuration de l'API.", variant: "destructive" })
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, une perturbation technique empêche l'analyse. Vérifiez que la clé API Gemini est bien configurée dans vos secrets." }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([{ role: 'model', content: 'Session réinitialisée. En quoi puis-je vous aider ?' }])
    toast({ title: "Historique effacé" })
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-slate-900 leading-tight">Assistant Studio</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Système de Savoir</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-slate-200 bg-white font-bold h-10 px-4" 
              onClick={handleClear}
            >
              <Plus className="w-4 h-4 mr-2" /> Nouveau
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              className="text-slate-400 hover:text-red-500 rounded-full font-bold h-10"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="flex-1 bg-white rounded-[3rem] shadow-2xl border-none overflow-hidden flex flex-col relative mb-6">
          <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <MessageSquare className="w-16 h-16 text-slate-100 mb-6" />
                <h2 className="text-2xl font-headline font-bold text-slate-800">Démarrer une analyse</h2>
                <p className="text-slate-400 mt-2 max-w-sm">Interrogez le système sur vos ressources ou sur un sujet spécifique.</p>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-4 max-w-[90%] md:max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      msg.role === 'user' ? "bg-white text-slate-300 border border-slate-100" : "bg-primary text-white"
                    )}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                      "p-5 rounded-[1.8rem] text-sm md:text-base leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-slate-100 text-slate-800 rounded-tr-none" 
                        : "bg-primary/5 text-slate-900 rounded-tl-none border border-primary/10"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-4 mr-auto">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="p-5 rounded-[1.8rem] rounded-tl-none bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100">
            <div className="relative max-w-3xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Votre message..."
                className="h-16 pl-6 pr-16 bg-white border-none shadow-xl rounded-full text-lg focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-slate-300"
                disabled={loading}
              />
              <Button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
