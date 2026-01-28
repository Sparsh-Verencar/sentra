"use client"

import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { getAuthUserId } from "@convex-dev/auth/server"


const AnnouncementCard = ({ announcement }: { announcement: any }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {announcement.title}
          </CardTitle>

          <Badge variant="secondary">
            {announcement.tags}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {announcement.date}
        </p>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          {announcement.description}
        </p>
      </CardContent>
    </Card>
  )
}

const AnnouncementSkeleton = () => {
  return (
    <Card className="w-full animate-pulse">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        <Skeleton className="h-3 w-24" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[75%]" />
      </CardContent>
    </Card>
  )
}





const AnnouncementsPage = () => {
  const announcements = useQuery(api.announcements.getAllAnnouncements)
  const createAnnouncement = useMutation(api.announcements.createAnnouncement)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      date: "",
    },
  })

  const onSubmit = async (data: any) => {
    /* const staff_id = getauthID*/ 
    //change this code below after staff id is available with auth
    const newData  = {
      ...data,
      staff_id:"kx72j7hggmq4edppkgmm68y9sn802z2j"
    }
    await createAnnouncement(newData)
    form.reset()
  }

  if (announcements === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (announcements.length === 0) {
    return <p className="p-6">No announcements yet.</p>
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>

        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>Create announcement</Button>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create announcement</DrawerTitle>
              <DrawerDescription>
                This announcement will be visible to all students.
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 pb-4 space-y-4">

              <FieldSet>
                <FieldGroup>

                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input {...form.register("title")} id="title" />
                    <FieldDescription>
                      Short and clear announcement title.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea {...form.register("description")} id="description" rows={4} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tags">Tag</FieldLabel>
                    <Input {...form.register("tags")} id="tags" />
                    <FieldDescription>
                      Used for filtering announcements.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <Input
                      {...form.register("date")}
                      id="date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </Field>

                </FieldGroup>
              </FieldSet>

              <DrawerFooter className="flex gap-2">
                <Button type="submit">Submit</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Announcement list */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <AnnouncementCard
            key={announcement._id}
            announcement={announcement}
          />
        ))}
      </div>
    </div>
  )
}

export default AnnouncementsPage

