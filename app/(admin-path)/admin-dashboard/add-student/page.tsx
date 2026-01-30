"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

/* ====================================================== */

export default function AddStudentPage() {
  const hostels = useQuery(api.hostels.getHostels);

  const [hostelId, setHostelId] = useState<string | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const blocks = useQuery(
    api.block.getBlocksByHostel,
    hostelId ? { hostelId } : "skip"
  );

  const rooms = useQuery(
    api.room.getRoomsByBlock,
    blockId ? { blockId } : "skip"
  );

  const studentCounts = useQuery(
    api.students.getStudentCountByRooms,
    blockId ? { blockId } : "skip"
  );

  const createStudent = useMutation(api.students.addStudent);

  /* ================= STUDENT FIELDS ================= */

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>

        {/* DRAWER TRIGGER */}
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button>Add Student</Button>
          </DrawerTrigger>

          <DrawerContent className="right-0 left-auto h-full w-[420px] rounded-none overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Add Student</DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4">

              <Field label="First Name">
                <Input value={fname} onChange={(e) => setFname(e.target.value)} />
              </Field>

              <Field label="Last Name">
                <Input value={lname} onChange={(e) => setLname(e.target.value)} />
              </Field>

              <Field label="Date of Birth">
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </Field>

              <Field label="Gender">
                <Select value={gender} onValueChange={(v: "male" | "female") => setGender(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Department">
                <Input value={dept} onChange={(e) => setDept(e.target.value)} />
              </Field>

              <Field label="Year of Study">
                <Input value={year} onChange={(e) => setYear(e.target.value)} />
              </Field>

              <Field label="Phone">
                <Input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>

              <Field label="Email">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>

              <Field label="Address">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>

              <Field label="Password">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>

              <Field label="Hostel">
                <Select
                  onValueChange={(v) => {
                    setHostelId(v);
                    setBlockId(null);
                    setRoomId(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels?.map((h) => (
                      <SelectItem key={h._id} value={h._id}>
                        {h.hostel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Block">
                <Select
                  disabled={!blocks}
                  onValueChange={(v) => {
                    setBlockId(v);
                    setRoomId(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks?.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        Block {b.block_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Room">
                <Select
                  disabled={!rooms}
                  value={roomId ?? undefined}
                  onValueChange={setRoomId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>

                  <SelectContent>
                    {rooms?.map((room) => {
                      const used = studentCounts?.[room._id] ?? 0;
                      const full = used >= room.capacity;

                      return (
                        <SelectItem key={room._id} value={room._id} disabled={full}>
                          Room {room.room_no}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({used}/{room.capacity})
                          </span>
                          {full && <Badge variant="destructive" className="ml-2">Full</Badge>}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </Field>

            </div>

            <DrawerFooter>
              <Button
                disabled={!roomId}
                onClick={() => {
                  createStudent({
                    fname,
                    lname,
                    date_of_birth: dob,
                    gender,
                    dept_name: dept,
                    year_of_study: year,
                    phone: Number(phone),
                    email,
                    address,
                    roomId: roomId!,
                    student_password: password,
                  });
                }}
              >
                Add Student
              </Button>

              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* STUDENT TREE */}
      <StudentTree />
    </div>
  );
}

/* ================= FIELD WRAPPER ================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* ================= STUDENT TREE ================= */
function StudentTree() {
  const hostels = useQuery(api.hostels.getHostels);

  if (!hostels) return null;

  return (
    <div className="space-y-6">
      {hostels.map((hostel) => (
        <HostelNode key={hostel._id} hostel={hostel} />
      ))}
    </div>
  );
}

/* ================= HOSTEL ================= */

function HostelNode({ hostel }: any) {
  const blocks = useQuery(
    api.block.getBlocksByHostel,
    hostel?._id ? { hostelId: hostel._id } : undefined
  );

  if (!blocks?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hostel.hostel_name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {blocks.map((block) => (
          <BlockNode key={block._id} block={block} />
        ))}
      </CardContent>
    </Card>
  );
}

/* ================= BLOCK ================= */

function BlockNode({ block }: any) {
  const rooms = useQuery(
    api.room.getRoomsByBlock,
    block?._id ? { blockId: block._id } : undefined
  );

  if (!rooms?.length) return null;

  return (
    <div className="ml-4 space-y-3">
      <p className="font-semibold">Block {block.block_name}</p>

      {rooms.map((room) => (
        <RoomNode key={room._id} room={room} />
      ))}
    </div>
  );
}

/* ================= ROOM ================= */

function RoomNode({ room }: any) {
  const students = useQuery(
    api.students.getStudentsByRoom,
    room?._id ? { roomId: room._id } : undefined
  );

  if (!students?.length) return null;

  return (
    <div className="ml-6 border rounded p-3">
      <p className="text-sm font-medium">
        Room {room.room_no}
      </p>

      <div className="mt-1 space-y-1 text-sm">
        {students.map((student: any) => (
          <div key={student._id}>
            • {student.fname} {student.lname}
          </div>
        ))}
      </div>
    </div>
  );
}
