
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Library, UserCircle2, Plus, X, ChevronRight, AlertCircle, Fingerprint } from 'lucide-react'
import { getOrCreateProfile, resolveEmailFromIdentifier } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

  const [identifier, setIdentifier] = useState('') // Email ou Pseudo
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
      console.error("Local storage error:", e)
    }
  }

  const removeAccount = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation()
    const updated = savedAccounts.filter(a => a.uid !== uid)
    localStorage.setItem('studio_saved_accounts', JSON.stringify(updated))
    setSavedAccounts(updated)
    if (updated.length === 0) setShowAccountSwitcher(false)
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!isSupabaseConfigured) return

    setLoading(true)
    try {
      const loginEmail = await resolveEmailFromIdentifier(identifier)
      if (!loginEmail) {
        throw new Error("Identifiant non reconnu. Utilisez votre email ou pseudo exact.")
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
      if (error) throw error
      
      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, {
          full_name: data.user.user_metadata?.full_name || 'Membre'
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

      toast({ title: "Connexion réussie !" })
      window.location.href = '/'
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) return

    setLoading(true)
    try {
      // Inscription via email (obligatoire pour Supabase Auth)
      const { data, error } = await supabase.auth.signUp({ 
        email: identifier, 
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (error) throw error
      
      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, {
          full_name: fullName,
          username: username.toLowerCase().replace(/\s/g, '_'),
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
      
      toast({ title: "Compte créé !" })
      window.location.href = '/'
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-primary rounded-3xl shadow-2xl mb-4 rotate-3">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight leading-none">Studio</h1>
            <p className="text-slate-500 font-medium">Votre accès au savoir partagé</p>
          </div>

          {showAccountSwitcher && savedAccounts.length > 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="font-headline font-bold text-lg">Comptes enregistrés</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {savedAccounts.map((acc) => (
                    <div 
                      key={acc.uid} 
                      onClick={() => {
                        setIdentifier(acc.email)
                        setShowAccountSwitcher(false)
                      }}
                      className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-4 ring-white shadow-md">
                          <AvatarImage src={acc.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{acc.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{acc.full_name}</p>
                          <p className="text-sm text-slate-400 font-medium">@{acc.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => removeAccount(e, acc.uid)}
                        >
                          <X className="w-5 h-5 text-slate-300 hover:text-red-500" />
                        </Button>
                        <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 bg-slate-50/30">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center gap-3 rounded-2xl h-14 text-primary font-bold hover:bg-white border-slate-200"
                    onClick={() => setShowAccountSwitcher(false)}
                  >
                    <Plus className="w-5 h-5" /> Ajouter un compte
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full animate-in fade-in duration-500">
              <TabsList className="grid w-full grid-cols-2 rounded-[1.5rem] h-14 mb-8 bg-slate-100 p-1">
                <TabsTrigger value="login" className="rounded-2xl font-bold text-base">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="rounded-2xl font-bold text-base">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6 pt-10">
                      <div className="space-y-2">
                        <Label htmlFor="identifier" className="font-bold text-slate-700 ml-2">Email ou Pseudo</Label>
                        <Input 
                          id="identifier" 
                          value={identifier} 
                          onChange={(e) => setIdentifier(e.target.value)} 
                          placeholder="votre@email.com ou @pseudo"
                          className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg"
                          disabled={loading}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-bold text-slate-700 ml-2">Mot de passe</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg"
                          disabled={loading}
                          required 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-10">
                      <Button className="w-full rounded-full h-16 font-bold text-xl shadow-xl shadow-primary/20" disabled={loading} type="submit">
                        {loading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                        Se connecter
                      </Button>
                      {savedAccounts.length > 0 && (
                        <Button 
                          variant="ghost" 
                          type="button"
                          className="w-full text-slate-400 font-bold"
                          onClick={() => setShowAccountSwitcher(true)}
                        >
                          Retour aux comptes enregistrés
                        </Button>
                      )}
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4 pt-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-bold text-slate-700 ml-2">Nom Complet</Label>
                          <Input 
                            id="name" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            placeholder="Jean Dupont"
                            className="rounded-2xl h-12 border-slate-100 bg-slate-50/50"
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username" className="font-bold text-slate-700 ml-2">Pseudo</Label>
                          <Input 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="jdupont"
                            className="rounded-2xl h-12 border-slate-100 bg-slate-50/50"
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="font-bold text-slate-700 ml-2">Email</Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          value={identifier} 
                          onChange={(e) => setIdentifier(e.target.value)} 
                          placeholder="votre@email.com"
                          className="rounded-2xl h-14 border-slate-100 bg-slate-50/50"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="font-bold text-slate-700 ml-2">Mot de passe</Label>
                        <Input 
                          id="reg-password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          className="rounded-2xl h-14 border-slate-100 bg-slate-50/50"
                          required 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pb-10">
                      <Button className="w-full rounded-full h-16 font-bold text-xl shadow-xl shadow-primary/20" disabled={loading} type="submit">
                        {loading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                        S'inscrire et démarrer
                      </Button>
                    </CardFooter>
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
