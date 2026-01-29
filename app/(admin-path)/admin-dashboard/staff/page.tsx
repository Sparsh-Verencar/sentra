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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { User as UserIcon } from "lucide-react"

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
  const [drawerOpen, setDrawerOpen] = useState(false)

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
  })

  const onSubmit = async (data: any) => {
    // convert phone to number
    await createStaff({
      ...data,
      phone: Number(data.phone),
    })
    form.reset()
    setDrawerOpen(false)
  }

  // group staff by role
  const staffByRole: Record<string, Staff[]> = {}

  roles.forEach((role: Role) => {
    staffByRole[role._id] =
      staffData.filter((s: Staff) => String(s.role_id) === role._id) ?? []
  })

  return (
    <div className="p-6 space-y-8">

      {/* ADD NEW STAFF BUTTON */}
      <div className="flex justify-start">
        <Button onClick={() => setDrawerOpen(true)}>
          Add Staff
        </Button>
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
                    {hostels.find((h) => h._id === s.hostel_id)?.hostel_name}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* ADD STAFF DRAWER */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerTrigger hidden />

        <DrawerContent className="overflow-y-auto h-full">
          <DrawerHeader>
            <DrawerTitle>Add New Staff</DrawerTitle>
            <DrawerDescription>
              Fill in staff details below
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-4 pb-4 space-y-4"
          >
            <FieldSet>

              <Field>
                <FieldLabel htmlFor="fname">First Name</FieldLabel>
                <Input {...form.register("fname")} id="fname" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="lname">Last Name</FieldLabel>
                <Input {...form.register("lname")} id="lname" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                <Select {...form.register("gender")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input {...form.register("phone")} id="phone" type="tel" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input {...form.register("email")} id="email" type="email" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input {...form.register("address")} id="address" />
              </Field>

              <Field>
                <FieldLabel htmlFor="role_id">Role</FieldLabel>

                <Controller
                  control={form.control}
                  name="role_id"
                  rules={{ required: "Please select a role" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((h: Role) => (
                          <SelectItem key={h._id} value={h._id}>
                            {h.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {form.formState.errors.hostel_id && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.hostel_id.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="hostel_id">Hostel</FieldLabel>

                <Controller
                  control={form.control}
                  name="hostel_id"
                  rules={{ required: "Please select a hostel" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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

                {form.formState.errors.hostel_id && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.hostel_id.message}
                  </p>
                )}
              </Field>

            </FieldSet>

            <DrawerFooter className="flex gap-2">
              <Button type="submit">Save</Button>
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
