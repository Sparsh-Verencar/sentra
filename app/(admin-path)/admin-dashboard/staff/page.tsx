"use client"

import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

import {
  Card,
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
  staff_password: string
}

type Role = {
  _id: string
  role_name: string
}

type Hostel = {
  _id: string
  hostel_name: string
}

const StaffCard = ({
  staff,
  hostelName,
  onEdit,
  onDelete,
}: {
  staff: Staff
  hostelName?: string
  onEdit: (staff: Staff) => void
  onDelete: (id: string) => void
}) => (
  <Card className="w-60 border shadow-sm">
    <CardHeader className="flex flex-col items-center gap-1 bg-muted p-2 rounded-t-md">
      <div className="rounded-full bg-secondary p-3">
        <UserIcon className="h-8 w-8 text-white" />
      </div>
      <CardTitle className="text-base font-semibold text-center">
        {staff.fname} {staff.lname}
      </CardTitle>
    </CardHeader>

    <div className="p-3 space-y-1 text-sm text-muted-foreground">
      <div className="flex justify-between">
        <span className="font-medium">Email:</span>
        <span>{staff.email}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-medium">Phone:</span>
        <span>{staff.phone}</span>
      </div>
      {hostelName && (
        <div className="flex justify-between">
          <span className="font-medium">Hostel:</span>
          <span>{hostelName}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="font-medium">Gender:</span>
        <span>{staff.gender}</span>
      </div>
    </div>

    <div className="flex justify-between p-3 border-t pt-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(staff)}>
        <EditIcon className="h-4 w-4 mr-1" /> Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(staff._id)}>
        <TrashIcon className="h-4 w-4 mr-1" /> Delete
      </Button>
    </div>
  </Card>
)

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
      staff_password: "",
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
      staff_password: "",
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
      staff_password: staff.staff_password,
    })
    setEditingStaff(staff)
    setDrawerOpen(true)
  }

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      phone: Number(data.phone),
      staff_password: data.staff_password, // admin-assigned password
    }

    if (editingStaff) {
      await updateStaff({
        id: editingStaff._id,
        ...payload,
      })
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
      (staffData as Staff[]).filter((s: Staff) => s.role_id === role._id) ?? []
  })

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-start">
        <Button onClick={openCreate}>Add Staff</Button>
      </div>

      {roles.map((role: Role) => (
        <div key={role._id}>
          <h2 className="text-lg font-semibold mb-2">{role.role_name}</h2>
          <div className="flex gap-4 flex-wrap">
            {staffByRole[role._id]?.map((s: Staff) => (
              <StaffCard
                key={s._id}
                staff={s}
                hostelName={hostels.find((h) => h._id === s.hostel_id)?.hostel_name}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ))}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerTrigger hidden />
        <DrawerContent className="overflow-y-auto h-full">
          <DrawerHeader>
            <DrawerTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DrawerTitle>
            <DrawerDescription>Fill in the details below</DrawerDescription>
          </DrawerHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 pb-4 space-y-4">
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="fname">First Name</FieldLabel>
                <Input {...form.register("fname", { required: true })} id="fname" />
              </Field>

              <Field>
                <FieldLabel htmlFor="lname">Last Name</FieldLabel>
                <Input {...form.register("lname", { required: true })} id="lname" />
              </Field>

              <Field>
                <FieldLabel>Gender</FieldLabel>
                <Controller
                  control={form.control}
                  name="gender"
                  rules={{ required: "Please select a gender" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input {...form.register("phone", { required: true })} id="phone" type="tel" />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input {...form.register("email", { required: true })} id="email" type="email" />
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input {...form.register("address")} id="address" />
              </Field>

              {/* PASSWORD FIELD */}
              <Field>
                <FieldLabel htmlFor="staff_password">Password</FieldLabel>
                <Input
                  {...form.register("staff_password", { required: true })}
                  id="staff_password"
                  type="password"
                  placeholder="Assign a password"
                />
              </Field>

              <Field>
                <FieldLabel>Role</FieldLabel>
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

              <Field>
                <FieldLabel>Hostel</FieldLabel>
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
              </Field>
            </FieldSet>

            <DrawerFooter className="flex gap-2">
              <Button type="submit">{editingStaff ? "Update" : "Save"}</Button>
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
