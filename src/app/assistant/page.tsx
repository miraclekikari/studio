"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Send, User, Bot, Loader2, Eraser, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { chatWithAssistant } from '@/ai/flows/chat-flow'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Bonjour ! Je suis votre Assistant Intelligent. Comment puis-je vous aider avec vos documents aujourd\'hui ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const result = await chatWithAssistant({
        message: userMessage,
        history: messages
      })
      setMessages(prev => [...prev, { role: 'model', content: result.response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, j'ai rencontré une petite erreur technique. Pouvez-vous réessayer ?" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-slate-900">Assistant Studio</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">En ligne • Intelligence Active</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMessages([{ role: 'model', content: 'Conversation réinitialisée. Comment puis-je vous aider ?' }])}
            className="text-slate-400 hover:text-primary rounded-full"
          >
            <Eraser className="w-4 h-4 mr-2" /> Effacer
          </Button>
        </div>

        <Card className="flex-1 bg-white rounded-[2.5rem] shadow-xl border-none overflow-hidden flex flex-col relative mb-6">
          <ScrollArea className="flex-1 p-6 md:p-10" ref={scrollRef}>
            <div className="space-y-8">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-slate-100 text-slate-600" : "bg-primary/10 text-primary"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "p-5 rounded-[1.5rem] text-sm md:text-base leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" 
                      : "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 mr-auto animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                  <div className="p-5 rounded-[1.5rem] rounded-tl-none bg-slate-50 border border-slate-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-slate-50/50 border-t">
            <div className="relative max-w-3xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez une question sur vos documents..."
                className="h-14 pl-6 pr-14 bg-white border-none shadow-xl rounded-full text-base focus-visible:ring-primary"
              />
              <Button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
              L'Assistant utilise l'IA pour traiter vos données de manière sécurisée.
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}
