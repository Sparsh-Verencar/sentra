"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

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

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
const emailSchema = z.email("Invalid email format");

export default function Staff_and_Students_Login() {
  const router = useRouter();
  


  /* ---------------- STUDENT ---------------- */
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentEmailError, setStudentEmailError] = useState("");

  /* ---------------- STAFF ---------------- */
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffEmailError, setStaffEmailError] = useState("");

  /* ---------------- ADMIN ---------------- */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminEmailError, setAdminEmailError] = useState("");

  /* ---------------- CONVEX ACTIONS ---------------- */
  const loginStudent = useAction(api.students.loginStudent);
  const loginStaff = useAction(api.staff.loginStaff);

  // ✅ NEW ADMIN LOGIN ACTION
  const loginAdmin = useAction(api.adminAuth.loginAdmin);

  /* ---------------- STUDENT LOGIN ---------------- */
  const handleStudentLogin = async () => {
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

  /* ---------------- STAFF LOGIN ---------------- */
  const handleStaffLogin = async () => {
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

  /* ---------------- ADMIN LOGIN ---------------- */
  const handleAdminLogin = async () => {
  const res = await loginAdmin({
    email: adminEmail,
    password: adminPassword,
  });

  alert(res.message);

  if (res.success) {
    router.push("/Onboarding");
  }
};


  const [isAdminSignup, setIsAdminSignup] = useState(false);

const [organisationName, setOrganisationName] = useState("");
const [adminName, setAdminName] = useState("");
const signupAdmin = useAction(api.adminAuth.signupAdmin);
const handleAdminSignup = async () => {
  const result = emailSchema.safeParse(adminEmail);

  if (!result.success) {
    setAdminEmailError(result.error.issues[0].message);
    return;
  }

  const res = await signupAdmin({
    organisation_name: organisationName,
    admin_name: adminName,
    email: adminEmail,
    password: adminPassword,
  });

  alert(res.message);

  // ✅ Redirect on success
  if (res.success) {
    router.push("/admin/onboarding");
  }
};


  return (
    <Tabs defaultValue="Student" className="w-[400px] mx-auto mt-10">
      {/* Tabs */}
      <TabsList className="w-full">
        <TabsTrigger value="Student" className="w-full">
          Student Login
        </TabsTrigger>

        <TabsTrigger value="Staff" className="w-full">
          Staff Login
        </TabsTrigger>

        {/* ✅ NEW ADMIN TAB */}
        <TabsTrigger value="Admin" className="w-full">
          Admin Login
        </TabsTrigger>
      </TabsList>

      {/* ---------------- STUDENT LOGIN ---------------- */}
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

      {/* ---------------- STAFF LOGIN ---------------- */}
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

      {/* ---------------- ADMIN LOGIN ---------------- */}
      <TabsContent value="Admin">
  <Card>
    <CardHeader>
      <CardTitle>
        {isAdminSignup ? "Admin Signup" : "Admin Login"}
      </CardTitle>

      <CardDescription className="space-y-3 mt-3">
        {/* ✅ Signup Fields */}
        {isAdminSignup && (
          <>
            <Input
              placeholder="Organisation Name"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
            />

            <Input
              placeholder="Admin Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </>
        )}

        {/* Email */}
        <Input
          placeholder="Admin Email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
        />

        {adminEmailError && (
          <p className="text-red-500 text-sm">{adminEmailError}</p>
        )}

        {/* Password */}
        <Input
          type="password"
          placeholder="Admin Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />

        {/* Button */}
        {isAdminSignup ? (
          <Button className="w-full" onClick={handleAdminSignup}>
            Signup Admin
          </Button>
        ) : (
          <Button className="w-full" onClick={handleAdminLogin}>
            Login Admin
          </Button>
        )}

        {/* Toggle */}
        <p
          className="text-sm text-blue-600 cursor-pointer text-center"
          onClick={() => setIsAdminSignup(!isAdminSignup)}
        >
          {isAdminSignup
            ? "Already have an account? Login"
            : "First time? Signup as Admin"}
        </p>
      </CardDescription>
    </CardHeader>
  </Card>
</TabsContent>

    </Tabs>
  );
}
