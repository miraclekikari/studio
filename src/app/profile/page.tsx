
"use client"

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  Users, 
  FileText, 
  Award,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const user = {
    name: "Alex Johnson",
    handle: "@alexj_dev",
    bio: "Passionate developer and educator. Sharing resources about modern web tech and system architecture. Always learning.",
    location: "Stockholm, Sweden",
    website: "alexj.dev",
    joined: "January 2024",
    followers: 842,
    following: 128,
    docsShared: 15,
    badges: ["Contributor", "Early Adopter", "Top Reviewer"]
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1">
        {/* Profile Header Background */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-[#63A5DE] to-[#3B1FA8] relative">
          <Button variant="secondary" className="absolute bottom-4 right-4 rounded-full bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20">
            <Edit className="w-4 h-4 mr-2" /> Change Cover
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-16 md:-mt-24 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-white shadow-xl">
                <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left pb-4">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-slate-900">{user.name}</h1>
                <p className="text-lg text-primary font-medium">{user.handle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-4 self-center md:self-end">
              <Button className="rounded-full px-8">Edit Profile</Button>
              <Button variant="outline" className="rounded-full bg-white shadow-sm px-8">Share</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-headline font-bold text-lg mb-4">About</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {user.bio}
                </p>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <Link href="#" className="text-primary hover:underline">{user.website}</Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user.joined}</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-8 border-t">
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.followers}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.following}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{user.docsShared}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Documents</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(badge => (
                    <Badge key={badge} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg h-fit">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-bold">You</span> uploaded a new document: 
                          <span className="text-primary font-medium hover:underline cursor-pointer ml-1">
                            Modern Web Architecture Guide 2024
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">2 days ago • Shared with Public</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary p-8 rounded-3xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Users className="w-32 h-32" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-2">Grow your network</h3>
                  <p className="text-sm opacity-80 mb-6">Connect with other experts and share knowledge to unlock premium community features.</p>
                  <Button variant="secondary" className="bg-white text-secondary hover:bg-white/90">Find Experts</Button>
                </div>
                
                <div className="bg-primary p-8 rounded-3xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <FileText className="w-32 h-32" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-2">Upload Content</h3>
                  <p className="text-sm opacity-80 mb-6">Share your whitepapers, books, or guides with the LibreShare world.</p>
                  <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">New Upload</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
