"use client";
const generatePassword = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};
import { studentSchema, staffSchema } from "../validator";

import { User, Mail, Trash2, Pencil } from "lucide-react";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import bcrypt from "bcryptjs";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
  CommandShortcut,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input";
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

  const addStudent = useMutation(api.students.addStudent);

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

    // ✅ HASH PASSWORD IN FRONTEND
    const hashedPassword = await bcrypt.hash(studentPassword, 10);

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

      // ✅ send hashed password
      student_password: hashedPassword,
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

    // ✅ Confirmation Popup
    const confirmDelete = window.confirm(
      "⚠ This will permanently delete this student.\n\nDo you want to continue?"
    );

    // If user clicks Cancel → Stop
    if (!confirmDelete) return;

    // ✅ Proceed with Delete
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

    // ✅ Prefill editable fields
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
          />

          <Button onClick={handleAdd}>Add</Button>
        </div>

        {/* Permissions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Permission</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {permissions?.length > 0 ? (
              permissions.map((p: any, index: number) => (
                <TableRow key={p._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{p.permission}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  No permissions added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }




  function RoleSection() {
    /* Queries */
    const roles = useQuery(api.roles.getRoles);
    const permissions = useQuery(api.permissions.getPermissions);

    /* Mutation */
    const addRole = useMutation(api.roles.addRole);

    /* Dialog State */
    const [open, setOpen] = useState(false);

    /* Form State */
    const [roleName, setRoleName] = useState("");
    const [selectedPermission, setSelectedPermission] =
      useState<Id<"permissions"> | null>(null);

    /* Submit */
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
          <h2 className="font-semibold text-sm">Roles List</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Role</Button>
            </DialogTrigger>

            {/* Dialog Form */}
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Role</DialogTitle>
                <DialogDescription>
                  Create a new role and assign permission.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Role Name */}
                <Input
                  placeholder="Role Name (e.g. Admin)"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />

                {/* Permission Dropdown */}
                <select
                  className="w-full border rounded-md p-2"
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
                <Button onClick={handleAddRole} className="w-full">
                  Save Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>Permission</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {roles?.length > 0 ? (
              roles.map((role: any, index: number) => (
                <TableRow key={role._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{role.role_name}</TableCell>
                  <TableCell>{role.permissionName}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No roles created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }


  function StaffSection() {
    /* Queries */
    const staff = useQuery(api.staff.getStaff);
    const hostels = useQuery(api.hostels.getHostelTypes);
    const roles = useQuery(api.roles.getRoles);


    /* Mutation */
    const addStaff = useMutation(api.staff.addStaff);

    /* Dialog */
    const [open, setOpen] = useState(false);

    /* Form Fields */
    const [selectedHostel, setSelectedHostel] =
      useState<Id<"hostel"> | null>(null);

    const [selectedRole, setSelectedRole] =
      useState<Id<"role"> | null>(null);

    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [gender, setGender] = useState("");

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [staffPassword, setStaffPassword] = useState("");
    const [showStaffPassword, setShowStaffPassword] = useState(false);



    /* Submit */
    const handleAddStaff = async () => {
      if (!selectedHostel || !selectedRole) {
        alert("Please select hostel and role");
        return;
      }

      // ✅ ZOD VALIDATION
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

      // ✅ HASH PASSWORD
      const hashedPassword = await bcrypt.hash(staffPassword, 10);

      // ✅ ADD STAFF
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
          <h2 className="text-sm font-semibold">Staff Members</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Staff</Button>
            </DialogTrigger>

            {/* Add Staff Dialog */}
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
                <DialogDescription>
                  Fill details and assign hostel + role.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {/* Hostel Dropdown */}
                <Label>Select Hostel Type</Label>
                <select
                  className="w-full border rounded-md p-2"
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

                {/* Role Dropdown */}
                <Label>Select Role</Label>
                <select
                  className="w-full border rounded-md p-2"
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

                {/* Staff Info Inputs */}
                <Input
                  placeholder="First Name"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                />

                <Input
                  placeholder="Last Name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                />

                <select
                  className="w-full border rounded-md p-2"
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
                />

                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {/* Staff Password */}
                <div className="space-y-2">
                  <Label>Password</Label>

                  <div className="flex gap-2">
                    <Input
                      type={showStaffPassword ? "text" : "password"}
                      placeholder="Enter or generate password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStaffPassword(generatePassword(10))}
                    >
                      Generate
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                    >
                      {showStaffPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>

                {/* Save */}
                <Button className="w-full" onClick={handleAddStaff}>
                  Save Staff
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Hostel</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password (Hashed)</TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>
            {staff?.length > 0 ? (
              staff.map((s: any, index: number) => (
                <TableRow key={s._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {s.fname} {s.lname}
                  </TableCell>
                  <TableCell>{s.hostelType}</TableCell>
                  <TableCell>{s.roleName}</TableCell>
                  <TableCell>{s.gender}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell className="text-xs break-all">
                    {s.staff_password}
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Tabs defaultValue="Student" className="w-full max-w-6xl mx-auto">

      <TabsList>
        <TabsTrigger value="Permission">Permissions</TabsTrigger>
        <TabsTrigger value="Role">Roles</TabsTrigger>
        <TabsTrigger value="Staff">Staffs</TabsTrigger>
        <TabsTrigger value="Student">Rooms</TabsTrigger>

      </TabsList>

      <TabsContent value="Permission">
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription className="space-y-6">

              {/* Permission Input */}
              <PermissionSection />

            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>


      <TabsContent value="Role">
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription className="space-y-6">
              <RoleSection />
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <TabsContent value="Staff">
        <Card>
          <CardHeader>
            <CardTitle>Management Staff</CardTitle>
            <CardDescription className="space-y-6">
              <StaffSection />
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>



      {/* ---------------------- ROOMS TAB ---------------------- */}
      <TabsContent value="Student">
        <Card>
          <CardHeader>
            <CardTitle>Hostel Rooms</CardTitle>

            <CardDescription className="space-y-6">
              {/* ---------------- HOSTEL SELECTOR ---------------- */}
              <div className="space-y-2">
                <Label>Select Hostel</Label>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {selectedHostel?.type ?? "Choose Hostel"}
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Hostel Type</DialogTitle>
                      <DialogDescription>
                        Pick Boys or Girls hostel
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 mt-4">
                      {hostelTypes?.map((hostel) => (
                        <Button
                          key={hostel._id.toString()}
                          variant="ghost"
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
                <div className="text-sm text-muted-foreground">
                  Selected Hostel: <b>{selectedHostel.type}</b>
                </div>
              )}

              {/* ---------------- BLOCK TABLE ---------------- */}
              {selectedHostel && !selectedBlock && (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Block No</TableHead>
                      <TableHead>Block Name</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredBlocks?.map((block: any, index: number) => (
                      <TableRow
                        key={block._id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedBlock(block._id);
                          setSelectedBlockName(block.block_name);

                          setSelectedRoom(null);
                          setSelectedRoomNo("");
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{block.block_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* ---------------- ROOM TABLE ---------------- */}
              {selectedBlock && !selectedRoom && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Selected Block: <b>{selectedBlockName}</b>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedBlock(null);
                        setSelectedBlockName("");
                      }}
                    >
                      Go Back
                    </Button>
                  </div>

                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room No</TableHead>
                        <TableHead>Capacity</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {rooms?.map((room: any) => (
                        <TableRow
                          key={room._id}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedRoom(room._id);
                            setSelectedRoomNo(room.room_no);
                          }}
                        >
                          <TableCell>{room.room_no}</TableCell>
                          <TableCell>{room.capacity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* ---------------- STUDENTS TABLE ---------------- */}
              {selectedRoom && (
                <>

                  {/* Header + Go Back */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Selected Room: <b>{selectedRoomNo}</b>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRoom(null);
                        setSelectedRoomNo("");
                      }}
                    >
                      Go Back
                    </Button>
                  </div>
                  {/* Add Student Button */}
                  <div className="flex justify-between items-center mt-4">
                    <h2 className="text-sm font-semibold">
                      Students in Room {selectedRoomNo}
                    </h2>

                    <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
                      <DialogTrigger asChild>
                        <Button>Add Student</Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Add Student</DialogTitle>
                          <DialogDescription>
                            Enter student details for this room.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                          <Input
                            placeholder="First Name"
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                          />

                          <Input
                            placeholder="Last Name"
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                          />

                          <Input
                            placeholder="Date of Birth"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                          />

                          <select
                            className="w-full border rounded-md p-2"
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
                          />

                          <Input
                            placeholder="Year of Study"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                          />

                          <Input
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />

                          <Input
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />

                          <Input
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />

                          {/* Password Input + Generate + Toggle */}
                          <div className="space-y-2">
                            <Label>Password</Label>

                            <div className="flex gap-2">
                              <Input
                                type={showStudentPassword ? "text" : "password"}
                                placeholder="Enter or generate password"
                                value={studentPassword}
                                onChange={(e) => setStudentPassword(e.target.value)}
                              />

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStudentPassword(generatePassword(10))}
                              >
                                Generate
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowStudentPassword(!showStudentPassword)}
                              >
                                {showStudentPassword ? "Hide" : "Show"}
                              </Button>
                            </div>
                          </div>

                          <Button onClick={handleAddStudent} className="w-full">
                            Save Student
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Students Table */}
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Password (Hashed)</TableHead>

                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {students?.length > 0 ? (
                        students.map((student: any) => (
                          <TableRow
                            key={student._id}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSelectedStudent(student);
                              setCommandOpen(true);
                            }}
                          >
                            <TableCell>{student.fname}</TableCell>
                            <TableCell>{student.lname}</TableCell>
                            <TableCell>{student.date_of_birth}</TableCell>
                            <TableCell>{student.gender}</TableCell>
                            <TableCell>{student.dept_name}</TableCell>
                            <TableCell>{student.year_of_study}</TableCell>
                            <TableCell>{student.phone}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.address}</TableCell>
                            <TableCell className="text-xs break-all">
                              {student.student_password}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-gray-500">
                            No students found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>

                  </Table>

                </>

              )}
              <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <CommandInput placeholder="Select an action..." />

                <CommandList>
                  <CommandEmpty>No actions found.</CommandEmpty>

                  {/* ✅ Student Info */}
                  {selectedStudent && (
                    <CommandGroup heading="Selected Student">
                      <CommandItem>
                        <User className="w-4 h-4 mr-2 text-gray-600" />
                        {selectedStudent.fname} {selectedStudent.lname}
                      </CommandItem>

                      <CommandItem>
                        <Mail className="w-4 h-4 mr-2 text-gray-600" />
                        {selectedStudent.email}
                      </CommandItem>
                    </CommandGroup>
                  )}

                  <CommandSeparator />

                  {/* ✅ Actions */}
                  <CommandGroup heading="Actions">
                    {/* Delete */}
                    <CommandItem
                      onSelect={handleDeleteStudent}
                      className="text-red-600 cursor-pointer"

                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Student
                    </CommandItem>

                    {/* Rename */}
                    <CommandItem
                      onSelect={handleRenameStudent}
                      className="text-blue-600 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Rename Details
                    </CommandItem>
                  </CommandGroup>

                </CommandList>
              </CommandDialog>
              <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit Student Details</DialogTitle>
                    <DialogDescription>
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
                    />

                    <Input
                      placeholder="Last Name"
                      value={editLname}
                      onChange={(e) => setEditLname(e.target.value)}
                    />

                    <Input
                      placeholder="Date of Birth"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                    />

                    <Input
                      placeholder="Department"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                    />

                    <Input
                      placeholder="Year of Study"
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                    />

                    <Input
                      placeholder="Phone"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />

                    <Input
                      placeholder="Address"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                    />

                    {/* Save Button */}
                    <Button className="w-full" onClick={handleSaveRename}>
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardDescription>
          </CardHeader>

        </Card>
      </TabsContent>
    </Tabs>
  );
}
