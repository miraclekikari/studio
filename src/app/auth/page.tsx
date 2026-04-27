
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Library, UserCircle2, Plus, X, ChevronRight } from 'lucide-react'
import { getOrCreateProfile } from '@/lib/db'
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
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const accounts = localStorage.getItem('studio_saved_accounts')
    if (accounts) {
      setSavedAccounts(JSON.parse(accounts))
    }
  }, [])

  const saveAccountToLocal = (account: StoredAccount) => {
    const existing = localStorage.getItem('studio_saved_accounts')
    let accounts: StoredAccount[] = existing ? JSON.parse(existing) : []
    
    // Éviter les doublons
    accounts = accounts.filter(a => a.uid !== account.uid)
    accounts.unshift(account)
    
    // Garder max 5 comptes
    accounts = accounts.slice(0, 5)
    
    localStorage.setItem('studio_saved_accounts', JSON.stringify(accounts))
    setSavedAccounts(accounts)
  }

  const removeAccount = (e: React.MouseEvent, uid: string) => {
    e.stopPropagation()
    const updated = savedAccounts.filter(a => a.uid !== uid)
    localStorage.setItem('studio_saved_accounts', JSON.stringify(updated))
    setSavedAccounts(updated)
  }

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const loginEmail = overrideEmail || email
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

      toast({ title: "Content de vous revoir !" })
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (error) throw error
      
      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, {
          full_name: fullName,
          username: fullName.toLowerCase().replace(/\s/g, '_')
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
      
      toast({ title: "Compte créé !", description: "Vous êtes maintenant connecté." })
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-primary rounded-2xl shadow-xl mb-4">
              <Library className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Studio</h1>
            <p className="text-slate-500 font-medium">Votre espace de savoir partagé</p>
          </div>

          {showAccountSwitcher && savedAccounts.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="font-headline font-bold text-lg">Comptes enregistrés</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {savedAccounts.map((acc) => (
                    <div 
                      key={acc.uid} 
                      onClick={() => {
                        setEmail(acc.email)
                        setShowAccountSwitcher(false)
                      }}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={acc.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{acc.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900">{acc.full_name}</p>
                          <p className="text-xs text-slate-400 font-medium">@{acc.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => removeAccount(e, acc.uid)}
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50/30">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 rounded-xl h-12 text-primary font-bold hover:bg-white"
                    onClick={() => setShowAccountSwitcher(false)}
                  >
                    <Plus className="w-5 h-5" /> Ajouter un compte
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-8 bg-slate-100 p-1">
                <TabsTrigger value="login" className="rounded-lg font-bold">Connexion</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg font-bold">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-headline font-bold">Ravi de vous revoir</CardTitle>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="votre@email.com"
                          className="rounded-xl h-12"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          className="rounded-xl h-12"
                          required 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <Button className="w-full rounded-full h-14 font-bold text-lg" disabled={loading} type="submit">
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Se connecter
                      </Button>
                      {savedAccounts.length > 0 && (
                        <Button 
                          variant="ghost" 
                          type="button"
                          className="w-full text-slate-400 font-medium"
                          onClick={() => setShowAccountSwitcher(true)}
                        >
                          Basculer vers un autre compte
                        </Button>
                      )}
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-headline font-bold">Créer un compte</CardTitle>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input 
                          id="name" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                          placeholder="Jean Dupont"
                          className="rounded-xl h-12"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="votre@email.com"
                          className="rounded-xl h-12"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Mot de passe</Label>
                        <Input 
                          id="reg-password" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          className="rounded-xl h-12"
                          required 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <Button className="w-full rounded-full h-14 font-bold text-lg shadow-xl shadow-primary/20" disabled={loading} type="submit">
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        S'inscrire et commencer
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
