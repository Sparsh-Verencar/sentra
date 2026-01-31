"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

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
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Trash2,
  Pencil,
  User,
  Mail,
  Phone,
  GraduationCap,
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/* ====================================================== */
/* TYPES */
/* ====================================================== */

type Gender = "male" | "female";
type HostelType = "boys" | "girls";

interface StudentFormData {
  fname: string;
  lname: string;
  gender: Gender;
  dept: string;
  year: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

/* ====================================================== */
/* CUSTOM HOOKS */
/* ====================================================== */

function useStudentForm() {
  const [formData, setFormData] = useState<StudentFormData>({
    fname: "",
    lname: "",
    gender: "male",
    dept: "",
    year: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });

  const [hostelId, setHostelId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      fname: "",
      lname: "",
      gender: formData.gender, // Keep gender
      dept: "",
      year: "",
      phone: "",
      email: "",
      address: "",
      password: "",
    });
    setHostelId("");
    setBlockId("");
    setRoomId("");
    setErrors({});
  }, [formData.gender]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fname.trim()) newErrors.fname = "First name is required";
    if (!formData.lname.trim()) newErrors.lname = "Last name is required";
    if (!formData.dept.trim()) newErrors.dept = "Department is required";
    if (!formData.year.trim()) newErrors.year = "Year is required";
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!hostelId) newErrors.hostelId = "Please select a hostel";
    if (!blockId) newErrors.blockId = "Please select a block";
    if (!roomId) newErrors.roomId = "Please select a room";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, hostelId, blockId, roomId]);

  return {
    formData,
    hostelId,
    blockId,
    roomId,
    errors,
    isSubmitting,
    setHostelId,
    setBlockId,
    setRoomId,
    setIsSubmitting,
    updateField,
    setGender: (gender: Gender) => {
      setFormData((prev) => ({ ...prev, gender }));
      setHostelId("");
      setBlockId("");
      setRoomId("");
      toast.info("Hostel selection reset due to gender change");
    },
    resetForm,
    validateForm,
  };
}

/* ====================================================== */
/* MAIN COMPONENT */
/* ====================================================== */

export default function AddStudentPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useStudentForm();
  const hostels = useQuery(api.hostels.getHostels);
  const addStudent = useAction(api.students.addStudent);

  const blocks = useQuery(
    api.block.getBlocksByHostel,
    form.hostelId ? { hostelId: form.hostelId as Id<"hostel"> } : "skip"
  );

  const rooms = useQuery(
    api.rooms.getRoomsByBlock,
    form.blockId ? { blockId: form.blockId as Id<"block"> } : "skip"
  );

  const selectedHostel = useMemo(
    () => hostels?.find((h) => h._id === form.hostelId),
    [hostels, form.hostelId]
  );

  const hostelType = selectedHostel?.hostel_type?.toLowerCase() as HostelType | undefined;

  // Filter hostels based on gender
  const filteredHostels = useMemo(() => {
    if (!hostels) return [];
    return hostels.filter((h) => {
      const type = h.hostel_type?.toLowerCase();
      return (
        (form.formData.gender === "male" && type === "boys") ||
        (form.formData.gender === "female" && type === "girls")
      );
    });
  }, [hostels, form.formData.gender]);

  const handleAddStudent = async () => {
    if (!form.validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Gender restriction check
    if (hostelType === "boys" && form.formData.gender !== "male") {
      toast.error("❌ Girls cannot be assigned to Boys Hostel");
      return;
    }

    if (hostelType === "girls" && form.formData.gender !== "female") {
      toast.error("❌ Boys cannot be assigned to Girls Hostel");
      return;
    }

    form.setIsSubmitting(true);

    try {
      await addStudent({
        fname: form.formData.fname,
        lname: form.formData.lname,
        date_of_birth: "TODO",
        gender: form.formData.gender,
        dept_name: form.formData.dept,
        year_of_study: form.formData.year,
        phone: Number(form.formData.phone),
        email: form.formData.email,
        address: form.formData.address,
        roomId: form.roomId as Id<"room">,
        student_password: form.formData.password,
      });

      toast.success("✅ Student Added Successfully!");
      form.resetForm();
      setDrawerOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to add student");
    } finally {
      form.setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student records and assignments
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button>Add Student</Button>
            </DrawerTrigger>

            <DrawerContent className="right-0 left-auto h-full w-full sm:w-[480px] rounded-none overflow-y-auto">
              <DrawerHeader>
                <DrawerTitle>Add New Student</DrawerTitle>
                <p className="text-sm text-muted-foreground">
                  Fill in the details below to add a new student
                </p>
              </DrawerHeader>

              {/* FORM */}
              <div className="p-4 space-y-4">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Personal Information
                  </h3>

                  <FormField
                    label="First Name"
                    required
                    error={form.errors.fname}
                  >
                    <Input
                      placeholder="Enter first name"
                      value={form.formData.fname}
                      onChange={(e) => form.updateField("fname", e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Last Name"
                    required
                    error={form.errors.lname}
                  >
                    <Input
                      placeholder="Enter last name"
                      value={form.formData.lname}
                      onChange={(e) => form.updateField("lname", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <Select
                      value={form.formData.gender}
                      onValueChange={(v: Gender) => form.setGender(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Hostel Assignment */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Hostel Assignment
                  </h3>

                  {filteredHostels.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No {form.formData.gender === "male" ? "boys" : "girls"} hostels available
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    label="Hostel"
                    required
                    error={form.errors.hostelId}
                    helper="Only hostels matching student gender are shown"
                  >
                    <Select
                      value={form.hostelId}
                      onValueChange={(v) => {
                        form.setHostelId(v);
                        form.setBlockId("");
                        form.setRoomId("");
                      }}
                      disabled={filteredHostels.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredHostels.map((h) => (
                          <SelectItem key={h._id} value={h._id}>
                            {h.hostel_name} ({h.hostel_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Block"
                    required
                    error={form.errors.blockId}
                  >
                    <Select
                      value={form.blockId}
                      disabled={!blocks?.length}
                      onValueChange={(v) => {
                        form.setBlockId(v);
                        form.setRoomId("");
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
                  </FormField>

                  <FormField
                    label="Room"
                    required
                    error={form.errors.roomId}
                  >
                    <Select
                      value={form.roomId}
                      disabled={!rooms?.length}
                      onValueChange={form.setRoomId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms?.map((room) => (
                          <SelectItem key={room._id} value={room._id}>
                            Room {room.room_no}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Academic Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Academic Information
                  </h3>

                  <FormField
                    label="Department"
                    required
                    error={form.errors.dept}
                  >
                    <Input
                      placeholder="e.g., Computer Science"
                      value={form.formData.dept}
                      onChange={(e) => form.updateField("dept", e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Year of Study"
                    required
                    error={form.errors.year}
                  >
                    <Select
                      value={form.formData.year}
                      onValueChange={(v) => form.updateField("year", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">First Year</SelectItem>
                        <SelectItem value="2">Second Year</SelectItem>
                        <SelectItem value="3">Third Year</SelectItem>
                        <SelectItem value="4">Fourth Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Contact Information
                  </h3>

                  <FormField
                    label="Phone Number"
                    required
                    error={form.errors.phone}
                  >
                    <Input
                      type="tel"
                      placeholder="10-digit number"
                      value={form.formData.phone}
                      onChange={(e) => form.updateField("phone", e.target.value.replace(/\D/g, ""))}
                      maxLength={10}
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    required
                    error={form.errors.email}
                  >
                    <Input
                      type="email"
                      placeholder="student@example.com"
                      value={form.formData.email}
                      onChange={(e) => form.updateField("email", e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Address"
                    required
                    error={form.errors.address}
                  >
                    <Input
                      placeholder="Enter full address"
                      value={form.formData.address}
                      onChange={(e) => form.updateField("address", e.target.value)}
                    />
                  </FormField>
                </div>

                {/* Account Security */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    Account Security
                  </h3>

                  <FormField
                    label="Password"
                    required
                    error={form.errors.password}
                    helper="Minimum 6 characters"
                  >
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={form.formData.password}
                      onChange={(e) => form.updateField("password", e.target.value)}
                    />
                  </FormField>
                </div>
              </div>

              {/* FOOTER */}
              <DrawerFooter>
                <Button
                  onClick={handleAddStudent}
                  disabled={form.isSubmitting}
                  className="w-full"
                >
                  {form.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Student...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>

                <DrawerClose asChild>
                  <Button variant="outline" disabled={form.isSubmitting}>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* STUDENT TREE */}
      <StudentTree searchQuery={searchQuery} />
    </div>
  );
}

/* ================= FORM FIELD WRAPPER ================= */

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  helper?: string;
}

function FormField({ label, children, required, error, helper }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

/* ================= STUDENT TREE ================= */

function StudentTree({ searchQuery }: { searchQuery: string }) {
  const hostels = useQuery(api.hostels.getHostels);

  if (!hostels) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (hostels.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hostels found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {hostels.map((hostel) => (
        <HostelNode key={hostel._id} hostel={hostel} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

/* ================= HOSTEL NODE ================= */

function HostelNode({ hostel, searchQuery }: any) {
  const blocks = useQuery(api.block.getBlocksByHostel, {
    hostelId: hostel._id,
  });

  if (!blocks?.length) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {hostel.hostel_name}
            <Badge variant="secondary">{hostel.hostel_type}</Badge>
          </CardTitle>
          <Badge variant="outline">{blocks.length} blocks</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {blocks.map((block: any) => (
          <BlockNode key={block._id} block={block} searchQuery={searchQuery} />
        ))}
      </CardContent>
    </Card>
  );
}

/* ================= BLOCK NODE ================= */

function BlockNode({ block, searchQuery }: any) {
  const rooms = useQuery(api.rooms.getRoomsByBlock, {
    blockId: block._id,
  });

  if (!rooms?.length) return null;

  return (
    <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
      <div className="flex items-center gap-2">
        <p className="font-semibold">Block {block.block_name}</p>
        <Badge variant="outline" className="text-xs">
          {rooms.length} rooms
        </Badge>
      </div>

      {rooms.map((room: any) => (
        <RoomNode key={room._id} room={room} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

/* ================= ROOM NODE ================= */

function RoomNode({ room, searchQuery }: any) {
  const students = useQuery(api.students.getStudentsByRoom, {
    roomId: room._id,
  });

  const deleteStudent = useMutation(api.students.deleteStudent);
  const updateStudent = useMutation(api.students.updateStudentDetails);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* Editable Fields */
  const [editFname, setEditFname] = useState("");
  const [editLname, setEditLname] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!students || !searchQuery.trim()) return students;
    
    const query = searchQuery.toLowerCase();
    return students.filter((s: any) =>
      s.fname.toLowerCase().includes(query) ||
      s.lname.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.dept_name.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  /* DELETE */
  const handleDelete = async () => {
    if (!selectedStudent) return;

    setIsDeleting(true);
    try {
      await deleteStudent({ studentId: selectedStudent._id });
      toast.success("Student deleted successfully");
      setDeleteOpen(false);
      setCommandOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  /* OPEN EDIT */
  const handleEdit = () => {
    if (!selectedStudent) return;

    setEditFname(selectedStudent.fname);
    setEditLname(selectedStudent.lname);
    setEditDept(selectedStudent.dept_name);
    setEditYear(selectedStudent.year_of_study);
    setEditPhone(String(selectedStudent.phone));
    setEditAddress(selectedStudent.address);

    setCommandOpen(false);
    setEditOpen(true);
  };

  /* SAVE EDIT */
  const handleSave = async () => {
    if (!selectedStudent) return;

    if (!editFname.trim() || !editLname.trim()) {
      toast.error("Name fields cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateStudent({
        studentId: selectedStudent._id,
        fname: editFname,
        lname: editLname,
        dept_name: editDept,
        year_of_study: editYear,
        phone: Number(editPhone),
        address: editAddress,
        date_of_birth: selectedStudent.date_of_birth,
      });

      toast.success("Student updated successfully");
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update student");
    } finally {
      setIsSaving(false);
    }
  };

  if (!filteredStudents?.length) return null;

  return (
    <div className="ml-6 border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Room {room.room_no}</p>
        <Badge variant="secondary" className="text-xs">
          {filteredStudents.length} student{filteredStudents.length !== 1 && "s"}
        </Badge>
      </div>

      <div className="space-y-3">
        {filteredStudents.map((student: any) => (
          <div
            key={student._id}
            className="p-3 rounded-md border bg-background cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => {
              setSelectedStudent(student);
              setCommandOpen(true);
            }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {student.fname} {student.lname}
                </p>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3" />
                    {student.dept_name} - Year {student.year_of_study}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {student.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    {student.phone}
                  </div>
                </div>
              </div>
              <Badge variant={student.gender === "male" ? "default" : "secondary"}>
                {student.gender}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* COMMAND DIALOG */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type to search actions..." />
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>

          {selectedStudent && (
            <>
              <CommandGroup heading="Student Details">
                <CommandItem disabled>
                  <User className="w-4 h-4 mr-2" />
                  {selectedStudent.fname} {selectedStudent.lname}
                </CommandItem>
                <CommandItem disabled>
                  <Mail className="w-4 h-4 mr-2" />
                  {selectedStudent.email}
                </CommandItem>
                <CommandItem disabled>
                  <Phone className="w-4 h-4 mr-2" />
                  {selectedStudent.phone}
                </CommandItem>
                <CommandItem disabled>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {selectedStudent.dept_name} - Year {selectedStudent.year_of_study}
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={handleEdit}
                  className="text-blue-600 dark:text-blue-400"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Details
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setCommandOpen(false);
                    setDeleteOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Student
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Update student information. Email, gender, and password cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FormField label="First Name" required>
              <Input
                value={editFname}
                onChange={(e) => setEditFname(e.target.value)}
              />
            </FormField>

            <FormField label="Last Name" required>
              <Input
                value={editLname}
                onChange={(e) => setEditLname(e.target.value)}
              />
            </FormField>

            <FormField label="Department">
              <Input
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
              />
            </FormField>

            <FormField label="Year of Study">
              <Select value={editYear} onValueChange={setEditYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Fourth Year</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Phone Number">
              <Input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
              />
            </FormField>

            <FormField label="Address">
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">
                {selectedStudent?.fname} {selectedStudent?.lname}
              </span>
              's record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
