"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { z } from "zod"; // ✅ Import Zod
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const emailSchema = z.email("Invalid email format");
export default function Staff_and_Students_Login() {
  
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  const [studentEmailError, setStudentEmailError] = useState("");
  const [staffEmailError, setStaffEmailError] = useState("");
  // Convex Mutations
  const loginStudent = useAction(api.students.loginStudent);
  const loginStaff = useAction(api.staff.loginStaff);

  // ✅ Student Login
    const handleStudentLogin = async () => {
    // 🔥 Validate Email using Zod
    const result = emailSchema.safeParse(studentEmail);

    if (!result.success) {
      setStudentEmailError(result.error.issues[0].message);
      return;
    }

    setStudentEmailError("");

    const res = await loginStudent({
      email: studentEmail,
      password: studentPassword,
    });

    alert(res.message);
  };

  // ✅ Staff Login
  const handleStaffLogin = async () => {
    // 🔥 Validate Email using Zod
    const result = emailSchema.safeParse(staffEmail);

    if (!result.success) {
      setStaffEmailError(result.error.issues[0].message);
      return;
    }

    setStaffEmailError("");

    const res = await loginStaff({
      email: staffEmail,
      password: staffPassword,
    });

    alert(res.message);
  };


  return (
    <Tabs defaultValue="Student" className="w-[400px] mx-auto mt-10">
      <TabsList className="w-full">
        <TabsTrigger value="Student" className="w-full">
          Student Login
        </TabsTrigger>

        <TabsTrigger value="Staff" className="w-full">
          Staff Login
        </TabsTrigger>
      </TabsList>

      {/* ✅ Student Login */}
      <TabsContent value="Student">
        <Card>
          <CardHeader>
            <CardTitle>Student Login</CardTitle>

            <CardDescription className="space-y-3 mt-3">
              <Input
                placeholder="Student Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />

              {/* ✅ Email Error */}
              {studentEmailError && (
                <p className="text-red-500 text-sm">{studentEmailError}</p>
              )}

              <Input
                type="password"
                placeholder="Student Password"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
              />

              <Button className="w-full" onClick={handleStudentLogin}>
                Login Student
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      {/* ✅ Staff Login */}
      <TabsContent value="Staff">
        <Card>
          <CardHeader>
            <CardTitle>Staff Login</CardTitle>

            <CardDescription className="space-y-3 mt-3">
              <Input
                placeholder="Staff Email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
              />

              {/* ✅ Email Error */}
              {staffEmailError && (
                <p className="text-red-500 text-sm">{staffEmailError}</p>
              )}

              <Input
                type="password"
                placeholder="Staff Password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
              />

              <Button className="w-full" onClick={handleStaffLogin}>
                Login Staff
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  );
}