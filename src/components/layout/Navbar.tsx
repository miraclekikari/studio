"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, User, Library, Settings, LogOut, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { auth } from '@/firebase/config'
import { onAuthStateChanged, signOut, type User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getOrCreateProfile } from '@/lib/db'
import { useToast } from '@/hooks/use-toast'

export function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // S'assurer que le profil existe en base
        try {
          await getOrCreateProfile(u.uid, {
            fullName: u.displayName || 'Utilisateur',
            avatarUrl: u.photoURL || ''
          })
        } catch (err) {
          console.error("Erreur profil:", err)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Bienvenue ! 👋",
        description: "Vous êtes maintenant connecté.",
      })
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter.",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Déconnexion",
        description: "À bientôt sur LibreShare !",
      })
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:bg-secondary transition-colors">
            <Library className="w-5 h-5 text-white" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:inline-block">LibreShare</span>
        </Link>

        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des documents..." 
            className="pl-10 bg-muted/50 border-none focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "Utilisateur"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library" className="cursor-pointer">
                      <Library className="mr-2 h-4 w-4" />
                      <span>Ma Bibliothèque</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" className="rounded-full px-6" onClick={handleSignIn}>
              Connexion
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
