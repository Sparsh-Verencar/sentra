"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { useAuthActions,  } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
const emailSchema = z.email("Invalid email format");

export default function Staff_and_Students_Login() {
  const router = useRouter();

  /* ---------------- CONVEX AUTH ---------------- */
  const { signIn } = useAuthActions();

  /* ---------------- STUDENT ---------------- */
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  /* ---------------- STAFF ---------------- */
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  /* ---------------- ADMIN ---------------- */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [organisationName, setOrganisationName] = useState("");
  const [adminName, setAdminName] = useState("");

  const [adminEmailError, setAdminEmailError] = useState("");

  const [isAdminSignup, setIsAdminSignup] = useState(false);

  /* ---------------- CONVEX ACTIONS ---------------- */
  const loginStudent = useAction(api.students.loginStudent);
  const loginStaff = useAction(api.staff.loginStaff);

  // ✅ Create organisation + admin row
   const { isAuthenticated, isLoading } = useConvexAuth();
  const signupAdminRecord = useMutation(api.admin.signupAdminRecord);
  const [pendingAdminSignup, setPendingAdminSignup] = useState<null | {
    organisation_name: string;
    admin_name: string;
    email: string;
    password: string;
  }>(null);

    useEffect(() => {
    if (!pendingAdminSignup) return;
    if (isLoading || !isAuthenticated) return;

    (async () => {
      try {
        await signupAdminRecord(pendingAdminSignup);
        setPendingAdminSignup(null);
        router.push("/Onboarding");
      } catch (err: any) {
        alert("Signup failed: " + err.message);
        setPendingAdminSignup(null);
      }
    })();
  }, [pendingAdminSignup, isAuthenticated, isLoading, signupAdminRecord, router]);

  const handleAdminSignup = async () => {
    try {
      await signIn("password", {
        email: adminEmail,
        password: adminPassword,
        flow: "signUp",
      });

      // Defer the mutation until Convex reports isAuthenticated === true
      setPendingAdminSignup({
        organisation_name: organisationName,
        admin_name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
    } catch (err: any) {
      alert("Signup failed: " + err.message);
    }
  };



  /* ---------------- STUDENT LOGIN ---------------- */
  const handleStudentLogin = async () => {
  await signIn("password", {
    email: studentEmail,
    password: studentPassword,
    flow: "signIn",
  });
  router.push("/StudentInfo");
};


  /* ---------------- STAFF LOGIN ---------------- */
  const handleStaffLogin = async () => {
    const res = await loginStaff({
      email: staffEmail,
      password: staffPassword,
    });

    alert(res.message);
  };

  /* ---------------- ADMIN SIGNUP ---------------- */
 
    



  /* ---------------- ADMIN LOGIN ---------------- */
  const handleAdminLogin = async () => {
  try {
    await signIn("password", {
      email: adminEmail,
      password: adminPassword,
      flow: "signIn",
    });

    router.push("/Onboarding");
  } catch (err: any) {
    alert("Login failed: " + err.message);
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

        <TabsTrigger value="Admin" className="w-full">
          Admin Login
        </TabsTrigger>
      </TabsList>

      {/* ---------------- STUDENT ---------------- */}
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

      {/* ---------------- STAFF ---------------- */}
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

      {/* ---------------- ADMIN ---------------- */}
      <TabsContent value="Admin">
        <Card>
          <CardHeader>
            <CardTitle>
              {isAdminSignup ? "Admin Signup" : "Admin Login"}
            </CardTitle>

            <CardDescription className="space-y-3 mt-3">
              {/* Signup Extra Fields */}
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
