"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useQuery, useMutation } from "convex/react"
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
import { Input } from "@/components/ui/input"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type Announcement = {
  _id: any
  title: string
  description: string
  tags: string
  date: string
}

type AnnouncementCardProps = {
  announcement: Announcement
  onEdit: (announcement: Announcement) => void
  onDelete: (id: string) => void
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onEdit,
  onDelete,
}) => (
  <Card className="w-full">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-base">{announcement.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {announcement.date}
          </p>
        </div>
        <Badge variant="secondary">{announcement.tags}</Badge>
      </div>
    </CardHeader>

    <CardContent>
      <p className="text-sm text-muted-foreground">
        {announcement.description}
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(announcement)}
        >
          Edit
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(announcement._id)}
        >
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
)


const AnnouncementsPage = () => {
  const announcements = useQuery(api.announcements.getAllAnnouncements)
  const createAnnouncement = useMutation(api.announcements.createAnnouncement)
  const updateAnnouncement = useMutation(api.announcements.updateAnnouncement)
  const deleteAnnouncement = useMutation(api.announcements.deleteAnnouncement)

  // drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filterTag, setFilterTag] = useState("")

  // null for create, announcement object for edit
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      date: "",
    },
  })

  // open drawer for create
  const startCreate = () => {
    form.reset({ title: "", description: "", tags: "", date: "" })
    setEditingAnnouncement(null)
    setDrawerOpen(true)
  }

  // open drawer for edit
  const startEdit = (announcement: any) => {
    form.reset({
      title: announcement.title,
      description: announcement.description,
      tags: announcement.tags,
      date: announcement.date,
    })
    setEditingAnnouncement(announcement)
    setDrawerOpen(true)
  }

  const onSubmit = async (data: any) => {
    if (editingAnnouncement) {
      await updateAnnouncement({
        id: editingAnnouncement._id,
        ...data,
      })
    } else {
      await createAnnouncement(data)
    }
    setDrawerOpen(false)
  }


  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      await deleteAnnouncement({ id })
    }
  }

  if (!announcements) {
    return <p className="p-6">Loading...</p>
  }

  const filteredAnnouncements = announcements.filter((a) =>
  !filterTag || a.tags.toLowerCase().includes(filterTag.toLowerCase())
)


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
      {/* Tag filter */}
      <div className="flex items-center gap-2 pb-4">
        <Input
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
        <Button variant="outline" onClick={() => setFilterTag("")}>
          Clear
        </Button>
      </div>
        <Button onClick={startCreate}>Create announcement</Button>
      </div>


      {/* Announcement list */}
      <div className="space-y-4">
        {announcements
          .filter((a) =>
            !filterTag || a.tags.toLowerCase().includes(filterTag.toLowerCase())
          )
          .map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          ))}
      </div>


      {/* Drawer for create/edit */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerTrigger hidden />

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingAnnouncement ? "Edit announcement" : "Create announcement"}
            </DrawerTitle>
            <DrawerDescription>
              This announcement will be visible to all students.
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-4 pb-4 space-y-4"
          >
            <FieldSet>
              <FieldGroup>

                {/* TITLE */}
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input {...form.register("title")} id="title" required />
                  <FieldDescription>
                    Short and clear announcement title.
                  </FieldDescription>
                </Field>

                {/* DESCRIPTION */}
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...form.register("description")}
                    id="description"
                    rows={4}
                    required
                  />
                </Field>

                {/* TAG */}
                <Field>
                  <FieldLabel htmlFor="tags">Tag</FieldLabel>
                  <Input {...form.register("tags")} id="tags" required />
                  <FieldDescription>
                    Used for filtering announcements.
                  </FieldDescription>
                </Field>

                {/* DATE */}
                <Field>
                  <FieldLabel htmlFor="date">Date</FieldLabel>
                  <Input
                    {...form.register("date")}
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </Field>

              </FieldGroup>
            </FieldSet>

            <DrawerFooter className="flex gap-2">
              <Button type="submit">
                {editingAnnouncement ? "Update" : "Submit"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default AnnouncementsPage
