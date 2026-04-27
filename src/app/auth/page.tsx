
"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/firebase/config'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Library, Mail, Lock, User, Github } from 'lucide-react'
import { getOrCreateProfile } from '@/lib/db'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Login states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register states
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      await getOrCreateProfile(result.user.uid, {
        fullName: result.user.displayName || 'Utilisateur',
        avatarUrl: result.user.photoURL || ''
      })
      toast({ title: "Bienvenue !", description: "Connexion réussie avec Google." })
      router.push('/')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      toast({ title: "Content de vous revoir !", description: "Connexion réussie." })
      router.push('/')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: "Email ou mot de passe incorrect." })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, regEmail, regPassword)
      await updateProfile(result.user, { displayName: regName })
      await getOrCreateProfile(result.user.uid, {
        fullName: regName,
        username: regName.toLowerCase().replace(/\s/g, '_')
      })
      toast({ title: "Compte créé !", description: "Bienvenue sur LibreShare." })
      router.push('/')
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
            <div className="inline-flex p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-4">
              <Library className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">LibreShare</h1>
            <p className="text-slate-500">Rejoignez la communauté du savoir</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-8">
              <TabsTrigger value="login" className="rounded-lg">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline font-bold">Bienvenue</CardTitle>
                  <CardDescription>Entrez vos identifiants pour vous connecter.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="nom@exemple.com" 
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Button variant="link" className="px-0 h-auto text-xs" type="button">Oublié ?</Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full rounded-full h-12 font-bold" disabled={loading} type="submit">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Se connecter
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Ou continuer avec</span></div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full rounded-full h-12 font-bold border-slate-200" 
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
                      Google
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline font-bold">Créer un compte</CardTitle>
                  <CardDescription>Commencez à partager vos connaissances dès aujourd'hui.</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="name" 
                          placeholder="Jean Dupont" 
                          className="pl-10"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="reg-email" 
                          type="email" 
                          placeholder="nom@exemple.com" 
                          className="pl-10"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="reg-password" 
                          type="password" 
                          className="pl-10"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full rounded-full h-12 font-bold" disabled={loading} type="submit">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      S'inscrire
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-slate-500 text-xs"
                      onClick={() => handleGoogleSignIn}
                    >
                      En vous inscrivant, vous acceptez nos CGU.
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
