"use client"

import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
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
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  User as UserIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
} from "lucide-react"

type Staff = {
  _id: string
  fname: string
  lname: string
  gender: string
  phone: number
  email: string
  address: string
  hostel_id: string
  role_id: string
}

type Role = {
  _id: string
  role_name: string
}

type Hostel = {
  _id: string
  hostel_name: string
}

export default function StaffPage() {
  const staffData = useQuery(api.staff.getAllStaff) ?? []
  const roles = useQuery(api.staff.getAllRoles) ?? []
  const hostels = useQuery(api.staff.getAllHostels) ?? []

  const createStaff = useMutation(api.staff.createStaff)
  const updateStaff = useMutation(api.staff.updateStaff)
  const deleteStaff = useMutation(api.staff.deleteStaff)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const form = useForm({
    defaultValues: {
      fname: "",
      lname: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      role_id: "",
      hostel_id: "",
    },
    mode: "onChange",
  })

  const openCreate = () => {
    form.reset({
      fname: "",
      lname: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      role_id: "",
      hostel_id: "",
    })
    setEditingStaff(null)
    setDrawerOpen(true)
  }

  const openEdit = (staff: Staff) => {
    form.reset({
      fname: staff.fname,
      lname: staff.lname,
      gender: staff.gender,
      phone: staff.phone.toString(),
      email: staff.email,
      address: staff.address,
      role_id: staff.role_id,
      hostel_id: staff.hostel_id,
    })
    setEditingStaff(staff)
    setDrawerOpen(true)
  }

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      phone: Number(data.phone),
    }

    if (editingStaff) {
      await updateStaff({ id: editingStaff._id, ...payload })
    } else {
      await createStaff(payload)
    }

    form.reset()
    setEditingStaff(null)
    setDrawerOpen(false)
  }

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this staff?")) {
      await deleteStaff({ id })
    }
  }

  // Group staff by role
  const staffByRole: Record<string, Staff[]> = {}
  roles.forEach((role: Role) => {
    staffByRole[role._id] =
      (staffData as Staff[]).filter((s: Staff) => s.role_id === role._id) ??
      []
  })

  return (
    <div className="p-6 space-y-8">

      {/* ADD NEW STAFF BUTTON */}
      <div className="flex justify-start">
        <Button onClick={openCreate}>Add Staff</Button>
      </div>

      {/* GROUPED STAFF SECTIONS */}
      {roles.map((role: Role) => (
        <div key={role._id}>
          <h2 className="text-lg font-semibold mb-2">{role.role_name}</h2>
          <div className="flex gap-4 flex-wrap">
            {staffByRole[role._id]?.map((s: Staff) => (
              <Card key={s._id} className="w-48">
                <CardHeader className="flex flex-col items-center gap-2">
                  <UserIcon className="h-10 w-10 text-muted-foreground" />
                  <CardTitle className="text-sm text-center">
                    {s.fname} {s.lname}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground text-center">
                    {s.email}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {s.phone}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {
                      hostels.find((h) => h._id === s.hostel_id)
                        ?.hostel_name
                    }
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(s)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* ADD / EDIT STAFF DRAWER */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        direction="right"
      >
        <DrawerTrigger hidden />

        <DrawerContent className="overflow-y-auto h-full">
          <DrawerHeader>
            <DrawerTitle>
              {editingStaff ? "Edit Staff" : "Add New Staff"}
            </DrawerTitle>
            <DrawerDescription>
              Fill in the details below
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-4 pb-4 space-y-4"
          >
            <FieldSet>

              {/* FIRST NAME */}
              <Field>
                <FieldLabel htmlFor="fname">First Name</FieldLabel>
                <Input
                  {...form.register("fname", { required: true })}
                  id="fname"
                />
              </Field>

              {/* LAST NAME */}
              <Field>
                <FieldLabel htmlFor="lname">Last Name</FieldLabel>
                <Input
                  {...form.register("lname", { required: true })}
                  id="lname"
                />
              </Field>

              {/* GENDER */}
              <Field>
                <FieldLabel>Gender</FieldLabel>
                <Controller
                  control={form.control}
                  name="gender"
                  rules={{ required: "Please select a gender" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* PHONE */}
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  {...form.register("phone", { required: true })}
                  id="phone"
                  type="tel"
                />
              </Field>

              {/* EMAIL */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...form.register("email", { required: true })}
                  id="email"
                  type="email"
                />
              </Field>

              {/* ADDRESS */}
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input {...form.register("address")} id="address" />
              </Field>

              {/* ROLE */}
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Controller
                  control={form.control}
                  name="role_id"
                  rules={{ required: "Please select a role" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r: Role) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* HOSTEL */}
              <Field>
                <FieldLabel>Hostel</FieldLabel>
                <Controller
                  control={form.control}
                  name="hostel_id"
                  rules={{ required: "Please select a hostel" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((h: Hostel) => (
                          <SelectItem key={h._id} value={h._id}>
                            {h.hostel_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

            </FieldSet>

            <DrawerFooter className="flex gap-2">
              <Button type="submit">
                {editingStaff ? "Update" : "Save"}
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
