"use client";
const generatePassword = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};
import { studentSchema, staffSchema } from "../validator";

import { User, Mail, Trash2, Pencil, ChevronLeft, Plus, Eye, EyeOff, KeyRound } from "lucide-react";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useAction } from "convex/react";
import bcrypt from "bcryptjs";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Onboarding_Roles() {
  /* ---------------- HOSTELS + BLOCKS ---------------- */

  const hostelTypes = useQuery(api.hostels.getHostelTypes);
  const blocks = useQuery(api.block.getBlocks);

  const [selectedHostel, setSelectedHostel] = useState<{
    id: Id<"hostel">;
    type: string;
  } | null>(null);

  const [open, setOpen] = useState(false);

  const filteredBlocks = blocks?.filter(
    (b: any) => b.hostel_id === selectedHostel?.id
  );

  /* ---------------- BLOCK + ROOM STATES ---------------- */

  const [selectedBlock, setSelectedBlock] = useState<Id<"block"> | null>(null);
  const [selectedBlockName, setSelectedBlockName] = useState("");
  const router = useRouter();

  const rooms = useQuery(
    api.rooms.getRoomsByBlock,
    selectedBlock ? { blockId: selectedBlock } : "skip"
  );

  /* ---------------- ROOM + STUDENT STATES ---------------- */

  const [selectedRoom, setSelectedRoom] = useState<Id<"room"> | null>(null);
  const [selectedRoomNo, setSelectedRoomNo] = useState("");

  const students = useQuery(
    api.students.getStudentsByRoom,
    selectedRoom ? { roomId: selectedRoom } : "skip"
  );

  const addStudent = useAction(api.students.addStudent);

  const currentCount = students?.length ?? 0;
  const roomCapacity = rooms?.find((r) => r._id === selectedRoom)?.capacity ?? 0;

  const isRoomFull = currentCount >= roomCapacity;

  const [studentOpen, setStudentOpen] = useState(false);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  const handleAddStudent = async () => {
    if (!selectedRoom) return;
    if (!selectedHostel) return;

    // ✅ Convert hostel type → expected gender
    const hostelType = selectedHostel.type.trim().toLowerCase();

    let expectedGender: "male" | "female" | null = null;

    if (hostelType.startsWith("boys")) {
      expectedGender = "male";
    }

    if (hostelType.startsWith("girls")) {
      expectedGender = "female";
    }

    // ✅ If hostel type is invalid
    if (!expectedGender) {
      alert("❌ Hostel type is invalid");
      return;
    }

    // ✅ Gender mismatch check
    if (gender !== expectedGender) {
      alert(
        `❌ Gender mismatch!\n\nSelected Hostel: ${selectedHostel.type}\nAllowed Gender: ${expectedGender}`
      );
      return;
    }

    const validation = studentSchema.safeParse({
      fname,
      lname,
      date_of_birth: dob,
      gender: gender,
      dept_name: dept,
      year_of_study: year,
      phone,
      email,
      address,
      student_password: studentPassword,
    });

    if (!validation.success) {
      alert(validation.error.issues[0].message);
      return;
    }
    if (!studentPassword.trim()) {
      alert("Please enter or generate a password");
      return;
    }

    await addStudent({
      fname,
      lname,
      date_of_birth: dob,
      gender,
      dept_name: dept,
      year_of_study: year,
      phone: Number(phone),
      email,
      address,
      roomId: selectedRoom,
      student_password: studentPassword,
    });

    // Reset form
    setFname("");
    setLname("");
    setDob("");
    setGender("");
    setDept("");
    setYear("");
    setPhone("");
    setEmail("");
    setAddress("");
    setStudentPassword("");
    setShowStudentPassword(false);

    setStudentOpen(false);
  };

  const [commandOpen, setCommandOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const deleteStudent = useMutation(api.students.deleteStudent);
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    const confirmDelete = window.confirm(
      "⚠ This will permanently delete this student.\n\nDo you want to continue?"
    );

    if (!confirmDelete) return;

    await deleteStudent({
      studentId: selectedStudent._id,
    });

    alert("✅ Student Deleted Successfully");

    setCommandOpen(false);
  };

  const updateStudent = useMutation(api.students.updateStudentDetails);
  const [renameOpen, setRenameOpen] = useState(false);

  /* Editable Fields */
  const [editFname, setEditFname] = useState("");
  const [editLname, setEditLname] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const handleRenameStudent = () => {
    if (!selectedStudent) return;

    setEditFname(selectedStudent.fname);
    setEditLname(selectedStudent.lname);
    setEditDob(selectedStudent.date_of_birth);
    setEditDept(selectedStudent.dept_name);
    setEditYear(selectedStudent.year_of_study);
    setEditPhone(String(selectedStudent.phone));
    setEditAddress(selectedStudent.address);

    setCommandOpen(false);
    setRenameOpen(true);
  };

  const handleSaveRename = async () => {
    if (!selectedStudent) return;

    await updateStudent({
      studentId: selectedStudent._id,
      fname: editFname,
      lname: editLname,
      date_of_birth: editDob,
      dept_name: editDept,
      year_of_study: editYear,
      phone: Number(editPhone),
      address: editAddress,
    });

    alert("Student Details Updated!");

    setRenameOpen(false);
  };

  function PermissionSection() {
    const permissions = useQuery(api.permissions.getPermissions);
    const addPermission = useMutation(api.permissions.addPermission);

    const [permissionText, setPermissionText] = useState("");

    const handleAdd = async () => {
      if (!permissionText.trim()) return;

      await addPermission({
        permission: permissionText,
      });

      setPermissionText("");
    };

    return (
      <div className="space-y-4">
        {/* Add Permission Form */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter permission (e.g. Manage Rooms)"
            value={permissionText}
            onChange={(e) => setPermissionText(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />

          <Button onClick={handleAdd} className="bg-white text-black hover:bg-zinc-200">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Permissions Table */}
        {permissions && permissions.length > 0 && (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                  <TableHead className="text-zinc-300">No.</TableHead>
                  <TableHead className="text-zinc-300">Permission</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {permissions.map((p: any, index: number) => (
                  <TableRow key={p._id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">{index + 1}</TableCell>
                    <TableCell className="text-zinc-200">{p.permission}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {(!permissions || permissions.length === 0) && (
          <div className="text-center py-8 text-zinc-500">
            No permissions added yet.
          </div>
        )}
      </div>
    );
  }

  function RoleSection() {
    const roles = useQuery(api.roles.getRoles);
    const permissions = useQuery(api.permissions.getPermissions);

    const addRole = useMutation(api.roles.addRole);

    const [open, setOpen] = useState(false);

    const [roleName, setRoleName] = useState("");
    const [selectedPermission, setSelectedPermission] =
      useState<Id<"permissions"> | null>(null);

    const handleAddRole = async () => {
      if (!roleName.trim()) return;
      if (!selectedPermission) return;

      await addRole({
        role_name: roleName,
        permission_id: selectedPermission,
      });

      setRoleName("");
      setSelectedPermission(null);
      setOpen(false);
    };

    return (
      <div className="space-y-6">
        {/* Add Role Button */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-sm text-zinc-300">Roles List</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-zinc-200">
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>

            {/* Dialog Form */}
            <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Add Role</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Create a new role and assign permission.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Role Name */}
                <Input
                  placeholder="Role Name (e.g. Admin)"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />

                {/* Permission Dropdown */}
                <select
                  className="w-full border rounded-md p-2 bg-zinc-800 border-zinc-700 text-white"
                  value={selectedPermission ?? ""}
                  onChange={(e) =>
                    setSelectedPermission(e.target.value as Id<"permissions">)
                  }
                >
                  <option value="">Select Permission</option>

                  {permissions?.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.permission}
                    </option>
                  ))}
                </select>

                {/* Save Button */}
                <Button onClick={handleAddRole} className="w-full bg-white text-black hover:bg-zinc-200">
                  Save Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Table */}
        {roles && roles.length > 0 && (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                  <TableHead className="text-zinc-300">No.</TableHead>
                  <TableHead className="text-zinc-300">Role Name</TableHead>
                  <TableHead className="text-zinc-300">Permission</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {roles.map((role: any, index: number) => (
                  <TableRow key={role._id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">{index + 1}</TableCell>
                    <TableCell className="text-zinc-200">{role.role_name}</TableCell>
                    <TableCell className="text-zinc-200">{role.permissionName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {(!roles || roles.length === 0) && (
          <div className="text-center py-8 text-zinc-500">
            No roles created yet.
          </div>
        )}
      </div>
    );
  }

  function StaffSection() {
    const staff = useQuery(api.staff.getStaff);
    const hostels = useQuery(api.hostels.getHostelTypes);
    const roles = useQuery(api.roles.getRoles);

    const addStaff = useMutation(api.staff.addStaff);

    const [open, setOpen] = useState(false);

    const [selectedHostel, setSelectedHostel] = useState<Id<"hostel"> | null>(null);
    const [selectedRole, setSelectedRole] = useState<Id<"role"> | null>(null);

    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [gender, setGender] = useState("");

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [staffPassword, setStaffPassword] = useState("");
    const [showStaffPassword, setShowStaffPassword] = useState(false);

    const handleAddStaff = async () => {
      if (!selectedHostel || !selectedRole) {
        alert("Please select hostel and role");
        return;
      }

      const validation = staffSchema.safeParse({
        fname,
        lname,
        gender,
        phone,
        email,
        address,
        staff_password: staffPassword,
        hostel_id: selectedHostel,
        role_id: selectedRole,
      });

      if (!validation.success) {
        alert(validation.error.issues[0].message);
        return;
      }

      const hashedPassword = await bcrypt.hash(staffPassword, 10);

      await addStaff({
        hostel_id: selectedHostel,
        role_id: selectedRole,
        fname,
        lname,
        gender,
        phone: Number(phone),
        email,
        address,
        staff_password: hashedPassword,
      });

      alert("✅ Staff Added Successfully!");

      // Reset
      setSelectedHostel(null);
      setSelectedRole(null);
      setFname("");
      setLname("");
      setGender("");
      setPhone("");
      setEmail("");
      setAddress("");
      setStaffPassword("");
      setShowStaffPassword(false);

      setOpen(false);
    };

    return (
      <div className="space-y-6">
        {/* Header + Add Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-300">Staff Members</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-zinc-200">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>

            {/* Add Staff Dialog */}
            <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Add Staff Member</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Fill details and assign hostel + role.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {/* Hostel Dropdown */}
                <div className="space-y-2">
                  <Label className="text-zinc-200">Select Hostel Type</Label>
                  <select
                    className="w-full border rounded-md p-2 bg-zinc-800 border-zinc-700 text-white"
                    value={selectedHostel ?? ""}
                    onChange={(e) =>
                      setSelectedHostel(e.target.value as Id<"hostel">)
                    }
                  >
                    <option value="">Choose Hostel</option>
                    {hostels?.map((h: any) => (
                      <option key={h._id} value={h._id}>
                        {h.hostel_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <Label className="text-zinc-200">Select Role</Label>
                  <select
                    className="w-full border rounded-md p-2 bg-zinc-800 border-zinc-700 text-white"
                    value={selectedRole ?? ""}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as Id<"role">)
                    }
                  >
                    <option value="">Choose Role</option>
                    {roles?.map((r: any) => (
                      <option key={r._id} value={r._id}>
                        {r.role_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Info Inputs */}
                <Input
                  placeholder="First Name"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />

                <Input
                  placeholder="Last Name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />

                <select
                  className="w-full border rounded-md p-2 bg-zinc-800 border-zinc-700 text-white"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <Input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />

                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />

                <Input
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />

                {/* Staff Password */}
                <div className="space-y-2">
                  <Label className="text-zinc-200">Password</Label>

                  <div className="flex gap-2">
                    <Input
                      type={showStaffPassword ? "text" : "password"}
                      placeholder="Enter or generate password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStaffPassword(generatePassword(10))}
                      className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Save */}
                <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={handleAddStaff}>
                  Save Staff
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Table */}
        {staff && staff.length > 0 && (
          <div className="rounded-lg border border-zinc-800 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                  <TableHead className="text-zinc-300">No.</TableHead>
                  <TableHead className="text-zinc-300">Name</TableHead>
                  <TableHead className="text-zinc-300">Hostel</TableHead>
                  <TableHead className="text-zinc-300">Role</TableHead>
                  <TableHead className="text-zinc-300">Gender</TableHead>
                  <TableHead className="text-zinc-300">Phone</TableHead>
                  <TableHead className="text-zinc-300">Email</TableHead>
                  <TableHead className="text-zinc-300">Password</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {staff.map((s: any, index: number) => (
                  <TableRow key={s._id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">{index + 1}</TableCell>
                    <TableCell className="text-zinc-200">
                      {s.fname} {s.lname}
                    </TableCell>
                    <TableCell className="text-zinc-200">{s.hostelType}</TableCell>
                    <TableCell className="text-zinc-200">{s.roleName}</TableCell>
                    <TableCell className="text-zinc-200 capitalize">{s.gender}</TableCell>
                    <TableCell className="text-zinc-200">{s.phone}</TableCell>
                    <TableCell className="text-zinc-200">{s.email}</TableCell>
                    <TableCell className="text-xs text-zinc-400 break-all max-w-xs">
                      {s.staff_password.substring(0, 20)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {(!staff || staff.length === 0) && (
          <div className="text-center py-8 text-zinc-500">
            No staff members found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <Tabs defaultValue="Student" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-zinc-800 border-zinc-700">
                <TabsTrigger value="Permission" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="Role" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Roles
                </TabsTrigger>
                <TabsTrigger value="Staff" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Staffs
                </TabsTrigger>
                <TabsTrigger value="Student" className="data-[state=active]:bg-white data-[state=active]:text-black">
                  Rooms
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Permission">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Permissions</h3>
                  <PermissionSection />
                </div>
              </TabsContent>

              <TabsContent value="Role">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Roles</h3>
                  <RoleSection />
                </div>
              </TabsContent>

              <TabsContent value="Staff">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Management Staff</h3>
                  <StaffSection />
                </div>
              </TabsContent>

              {/* ---------------------- ROOMS TAB ---------------------- */}
              <TabsContent value="Student">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Hostel Rooms</h3>

                  {/* ---------------- HOSTEL SELECTOR ---------------- */}
                  <div className="space-y-2">
                    <Label className="text-zinc-200">Select Hostel</Label>

                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                          {selectedHostel?.type ?? "Choose Hostel"}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="bg-zinc-900 border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Select Hostel Type</DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            Pick Boys or Girls hostel
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-2 mt-4">
                          {hostelTypes?.map((hostel) => (
                            <Button
                              key={hostel._id.toString()}
                              variant="outline"
                              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                              onClick={() => {
                                setSelectedHostel({
                                  id: hostel._id,
                                  type: hostel.hostel_type,
                                });

                                setSelectedBlock(null);
                                setSelectedBlockName("");

                                setSelectedRoom(null);
                                setSelectedRoomNo("");

                                setOpen(false);
                              }}
                            >
                              {hostel.hostel_type}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* ---------------- SHOW SELECTED HOSTEL ---------------- */}
                  {selectedHostel && (
                    <div className="text-sm text-zinc-400">
                      Selected Hostel: <span className="text-white font-medium">{selectedHostel.type}</span>
                    </div>
                  )}

                  {/* ---------------- BLOCK TABLE ---------------- */}
                  {selectedHostel && !selectedBlock && (
                    <div className="rounded-lg border border-zinc-800 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                            <TableHead className="text-zinc-300">Block No</TableHead>
                            <TableHead className="text-zinc-300">Block Name</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredBlocks?.map((block: any, index: number) => (
                            <TableRow
                              key={block._id}
                              className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50"
                              onClick={() => {
                                setSelectedBlock(block._id);
                                setSelectedBlockName(block.block_name);

                                setSelectedRoom(null);
                                setSelectedRoomNo("");
                              }}
                            >
                              <TableCell className="text-white font-medium">{index + 1}</TableCell>
                              <TableCell className="text-zinc-200">{block.block_name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* ---------------- ROOM TABLE ---------------- */}
                  {selectedBlock && !selectedRoom && (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                        <div className="text-sm text-zinc-400">
                          Selected Block: <span className="text-white font-medium">{selectedBlockName}</span>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedBlock(null);
                            setSelectedBlockName("");
                          }}
                          className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Go Back
                        </Button>
                      </div>

                      <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                              <TableHead className="text-zinc-300">Room No</TableHead>
                              <TableHead className="text-zinc-300">Capacity</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {rooms?.map((room: any) => (
                              <TableRow
                                key={room._id}
                                className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50"
                                onClick={() => {
                                  setSelectedRoom(room._id);
                                  setSelectedRoomNo(room.room_no);
                                }}
                              >
                                <TableCell className="text-white font-medium">{room.room_no}</TableCell>
                                <TableCell className="text-zinc-200">{room.capacity} persons</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}

                  {/* ---------------- STUDENTS TABLE ---------------- */}
                  {selectedRoom && (
                    <>
                      {/* Header + Go Back */}
                      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                        <div>
                          <div className="text-sm text-zinc-400">
                            Selected Room: <span className="text-white font-medium">{selectedRoomNo}</span>
                          </div>
                          <div className="text-sm text-zinc-400 mt-1">
                            Students: <span className="text-white font-medium">{currentCount} / {roomCapacity}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRoom(null);
                            setSelectedRoomNo("");
                          }}
                          className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Go Back
                        </Button>
                      </div>

                      {/* Add Student Button */}
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-zinc-300">
                          Students in Room {selectedRoomNo}
                        </h4>

                        {isRoomFull && (
                          <p className="text-red-400 text-sm font-medium">
                            ❌ Room is full
                          </p>
                        )}

                        <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
                          <DialogTrigger asChild>
                            <Button disabled={isRoomFull} className="bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500">
                              <Plus className="mr-2 h-4 w-4" />
                              {isRoomFull ? "Room Full" : "Add Student"}
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-white">Add Student</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Enter student details for this room.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 mt-4">
                              <Input
                                placeholder="First Name"
                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <Input
                                placeholder="Last Name"
                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <Input
                                placeholder="Date of Birth (YYYY-MM-DD)"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <select
                                className="w-full border rounded-md p-2 bg-zinc-800 border-zinc-700 text-white"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>

                              <Input
                                placeholder="Department"
                                value={dept}
                                onChange={(e) => setDept(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <Input
                                placeholder="Year of Study"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <Input
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <Input
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              <Input
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />

                              {/* Password Input + Generate + Toggle */}
                              <div className="space-y-2">
                                <Label className="text-zinc-200">Password</Label>

                                <div className="flex gap-2">
                                  <Input
                                    type={showStudentPassword ? "text" : "password"}
                                    placeholder="Enter or generate password"
                                    value={studentPassword}
                                    onChange={(e) => setStudentPassword(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                  />

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStudentPassword(generatePassword(10))}
                                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                                  >
                                    {showStudentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>

                              <Button onClick={handleAddStudent} className="w-full bg-white text-black hover:bg-zinc-200">
                                Save Student
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Students Table */}
                      {students && students.length > 0 && (
                        <div className="rounded-lg border border-zinc-800 overflow-hidden overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                                <TableHead className="text-zinc-300">First Name</TableHead>
                                <TableHead className="text-zinc-300">Last Name</TableHead>
                                <TableHead className="text-zinc-300">DOB</TableHead>
                                <TableHead className="text-zinc-300">Gender</TableHead>
                                <TableHead className="text-zinc-300">Department</TableHead>
                                <TableHead className="text-zinc-300">Year</TableHead>
                                <TableHead className="text-zinc-300">Phone</TableHead>
                                <TableHead className="text-zinc-300">Email</TableHead>
                                <TableHead className="text-zinc-300">Address</TableHead>
                                <TableHead className="text-zinc-300">Password</TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {students.map((student: any) => (
                                <TableRow
                                  key={student._id}
                                  className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setCommandOpen(true);
                                  }}
                                >
                                  <TableCell className="text-zinc-200">{student.fname}</TableCell>
                                  <TableCell className="text-zinc-200">{student.lname}</TableCell>
                                  <TableCell className="text-zinc-200">{student.date_of_birth}</TableCell>
                                  <TableCell className="text-zinc-200 capitalize">{student.gender}</TableCell>
                                  <TableCell className="text-zinc-200">{student.dept_name}</TableCell>
                                  <TableCell className="text-zinc-200">{student.year_of_study}</TableCell>
                                  <TableCell className="text-zinc-200">{student.phone}</TableCell>
                                  <TableCell className="text-zinc-200">{student.email}</TableCell>
                                  <TableCell className="text-zinc-200">{student.address}</TableCell>
                                  <TableCell className="text-xs text-zinc-400 break-all max-w-xs">
                                    {student.student_password.substring(0, 20)}...
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {(!students || students.length === 0) && (
                        <div className="text-center py-8 text-zinc-500">
                          No students found in this room.
                        </div>
                      )}
                    </>
                  )}

                  <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                    <CommandInput placeholder="Select an action..." className="bg-zinc-900 text-white border-zinc-800" />

                    <CommandList className="bg-zinc-900 border-zinc-800">
                      <CommandEmpty className="text-zinc-400">No actions found.</CommandEmpty>

                      {/* ✅ Student Info */}
                      {selectedStudent && (
                        <CommandGroup heading="Selected Student" className="text-zinc-300">
                          <CommandItem className="text-zinc-200">
                            <User className="w-4 h-4 mr-2 text-zinc-400" />
                            {selectedStudent.fname} {selectedStudent.lname}
                          </CommandItem>

                          <CommandItem className="text-zinc-200">
                            <Mail className="w-4 h-4 mr-2 text-zinc-400" />
                            {selectedStudent.email}
                          </CommandItem>
                        </CommandGroup>
                      )}

                      <CommandSeparator className="bg-zinc-800" />

                      {/* ✅ Actions */}
                      <CommandGroup heading="Actions" className="text-zinc-300">
                        {/* Delete */}
                        <CommandItem
                          onSelect={handleDeleteStudent}
                          className="text-red-400 cursor-pointer hover:bg-zinc-800"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Student
                        </CommandItem>

                        {/* Rename */}
                        <CommandItem
                          onSelect={handleRenameStudent}
                          className="text-blue-400 cursor-pointer hover:bg-zinc-800"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Details
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </CommandDialog>

                  <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                    <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Student Details</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          You can update name, department, year, phone, address.
                          <br />
                          ❌ Gender, Email, Password cannot be changed.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3 mt-4">
                        <Input
                          placeholder="First Name"
                          value={editFname}
                          onChange={(e) => setEditFname(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        <Input
                          placeholder="Last Name"
                          value={editLname}
                          onChange={(e) => setEditLname(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        <Input
                          placeholder="Date of Birth"
                          value={editDob}
                          onChange={(e) => setEditDob(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        <Input
                          placeholder="Department"
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        <Input
                          placeholder="Year of Study"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        <Input
                          placeholder="Phone"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        <Input
                          placeholder="Address"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />

                        {/* Save Button */}
                        <Button className="w-full bg-white text-black hover:bg-zinc-200" onClick={handleSaveRename}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ---------------- NEXT BUTTON ---------------- */}
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/admin-dashboard")}
            className="bg-white text-black hover:bg-zinc-200"
            size="lg"
          >
            Complete Setup
            <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}