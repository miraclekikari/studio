
"use client"

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Fingerprint, Plus, X, ChevronRight } from 'lucide-react'
import { getOrCreateProfile, resolveEmailFromIdentifier } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StoredAccount {
  uid: string;
  email: string;
  full_name: string;
  avatar_url: string;
  username: string;
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([])
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)
  const { toast } = useToast()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const accounts = localStorage.getItem('studio_saved_accounts')
    if (accounts) {
      const parsed = JSON.parse(accounts)
      setSavedAccounts(parsed)
      if (parsed.length > 0) setShowAccountSwitcher(true)
    }
  }, [])

  const saveAccountToLocal = (account: StoredAccount) => {
    try {
      const existing = localStorage.getItem('studio_saved_accounts')
      let accounts: StoredAccount[] = existing ? JSON.parse(existing) : []
      accounts = accounts.filter(a => a.uid !== account.uid)
      accounts.unshift(account)
      accounts = accounts.slice(0, 5)
      localStorage.setItem('studio_saved_accounts', JSON.stringify(accounts))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const loginEmail = await resolveEmailFromIdentifier(identifier)
      if (!loginEmail) throw new Error("Pseudo ou Email inconnu.")

      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
      if (error) throw error
      
      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, {
          full_name: data.user.user_metadata?.full_name
        })
        if (profile) {
          saveAccountToLocal({
            uid: data.user.id,
            email: data.user.email!,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            username: profile.username
          })
        }
      }
      window.location.href = '/'
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: identifier, 
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) throw error
      
      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, {
          full_name: fullName,
          username: username.toLowerCase().trim(),
          email: data.user.email
        })
        if (profile) {
          saveAccountToLocal({
            uid: data.user.id,
            email: data.user.email!,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            username: profile.username
          })
        }
      }
      toast({ title: "Bienvenue dans le Studio !" })
      window.location.href = '/'
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex p-6 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/30 rotate-3">
              <Fingerprint className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-headline font-bold text-slate-900 tracking-tighter">Studio</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Système de Savoir Partagé</p>
          </div>

          {showAccountSwitcher && savedAccounts.length > 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden bg-white">
                <div className="p-8 border-b bg-slate-50/50">
                  <h2 className="font-headline font-bold text-xl">Comptes actifs</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {savedAccounts.map((acc) => (
                    <div 
                      key={acc.uid} 
                      onClick={() => { setIdentifier(acc.email); setShowAccountSwitcher(false); }}
                      className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-5">
                        <Avatar className="w-16 h-16 ring-4 ring-white shadow-xl">
                          <AvatarImage src={acc.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{acc.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 text-xl">{acc.full_name}</p>
                          <p className="text-sm text-primary font-bold">@{acc.username}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
                <div className="p-6">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-2xl h-14 font-bold border-slate-200 text-slate-500"
                    onClick={() => setShowAccountSwitcher(false)}
                  >
                    <Plus className="w-5 h-5 mr-2" /> Utiliser un autre compte
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl h-14 mb-8 bg-slate-100 p-1">
                <TabsTrigger value="login" className="rounded-xl font-bold">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-4">Pseudo ou Email</Label>
                      <Input 
                        value={identifier} 
                        onChange={(e) => setIdentifier(e.target.value)} 
                        className="rounded-2xl h-14 bg-slate-50 border-none focus-visible:ring-primary"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-4">Mot de passe</Label>
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="rounded-2xl h-14 bg-slate-50 border-none"
                        required 
                      />
                    </div>
                    <Button className="w-full rounded-full h-16 font-bold text-xl shadow-xl shadow-primary/20 mt-4" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : "Accéder au Studio"}
                    </Button>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-4 text-xs">Nom complet</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-2xl h-12 bg-slate-50 border-none" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-4 text-xs">Pseudo (@)</Label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-2xl h-12 bg-slate-50 border-none" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-4">Email de contact</Label>
                      <Input type="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="rounded-2xl h-14 bg-slate-50 border-none" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-4">Mot de passe</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl h-14 bg-slate-50 border-none" required />
                    </div>
                    <Button className="w-full rounded-full h-16 font-bold text-xl shadow-xl shadow-primary/20 mt-4" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : "Créer mon espace"}
                    </Button>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
