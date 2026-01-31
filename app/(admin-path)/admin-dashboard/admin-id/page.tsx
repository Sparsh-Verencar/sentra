"use client"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { Building2, Mail, User, Shield } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel";
export default function AdminId() {
  const admin = useQuery(api.admin.getCurrentAdmin, {});
  console.log(`frontend admin:${admin}`)
  
  if (admin === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-zinc-400">Loading admin details...</p>
        </div>
      </div>
    );
  }

  if (admin === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Shield className="h-12 w-12 text-zinc-500 mx-auto" />
              <h3 className="text-lg font-semibold text-white">No Admin Found</h3>
              <p className="text-zinc-400 text-sm">Please sign in to continue</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get initials for avatar fallback
  const initials = admin.admin_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-4xl bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Admin Profile</h2>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            
            {/* LEFT SIDE - Avatar */}
            <div className="flex items-center justify-center md:w-2/5 bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 md:p-12">
              <div className="relative">
                <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-white shadow-xl">
                  <AvatarImage src="/avatar.png" className="object-cover" />
                  <AvatarFallback className="bg-white text-black text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Optional: Status indicator */}
                <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-zinc-900"></div>
              </div>
            </div>

            {/* RIGHT SIDE - Information */}
            <div className="flex-1 p-8 md:p-12 space-y-6">
              
              {/* Name Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <User className="h-4 w-4" />
                  <span className="uppercase tracking-wider font-medium">Full Name</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {admin.admin_name}
                </h3>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-800"></div>

              {/* Email Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Mail className="h-4 w-4" />
                  <span className="uppercase tracking-wider font-medium">Email Address</span>
                </div>
                <p className="text-lg text-zinc-200 font-medium">
                  {admin.email}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-800"></div>

              {/* Organization Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span className="uppercase tracking-wider font-medium">Organisation</span>
                </div>
                <p className="text-lg text-zinc-200 font-medium">
                  {admin.organisation_name || (
                    <span className="text-zinc-500 italic">Not specified</span>
                  )}
                </p>
              </div>

              {/* Optional: Role Badge */}
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-semibold">
                  <Shield className="h-4 w-4" />
                  Administrator
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}