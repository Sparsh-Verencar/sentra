"use client"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { skip } from "node:test"

export default function AdminId() {
  const admin_details = useQuery(api.users.getAdmin, 'skip')
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-3xl border-2 border-accent-foreground">
        <CardContent className="flex flex-col md:flex-row items-center md:items-stretch gap-6 p-6">

          {/* IMAGE */}
          <div className="flex justify-center md:justify-start md:w-[35%]">
            <Avatar className="h-[20vh] w-[20vw] md:h-32 md:w-32">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-center text-center md:text-left gap-1 md:w-[65%]">
            <h2 className="text-lg md:text-xl font-semibold">
              Name:{admin_details?.fname} {admin_details?.lname}
            </h2>
            <p className="text-sm text-muted-foreground">
              Admin ID: {admin_details?._id}
            </p>
            <p className="text-sm text-muted-foreground">
              Gender: {admin_details?.gender}
            </p>
            <p className="text-sm text-muted-foreground">
              Phone:+91 {admin_details?.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              Email: {admin_details?.email}
            </p>

            <p className="text-sm text-muted-foreground">
              Address: {admin_details?.address}
            </p>
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}
