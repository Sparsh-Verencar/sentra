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
        router.push("/Onboarding_Roles");
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

    router.push("/admin-dashboard");
  } catch (err: any) {
    alert("Login failed: " + err.message);
  }
};



  return (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

    {/* ================= LEFT BRAND PANEL ================= */}
    <div className="hidden lg:flex flex-col justify-center px-16
      bg-gradient-to-br from-grey-600 to-purple-900 
      text-white">

      <h1 className="text-4xl font-bold mb-4">
        Sentra
      </h1>

      <p className="text-lg opacity-90 max-w-md">
        Manage students, staff, hostels, rooms, and complaints —
        all from one centralized platform.
      </p>

      <div className="mt-10 text-sm opacity-80">
        © {new Date().getFullYear()} Sentra
      </div>
    </div>

    {/* ================= RIGHT LOGIN PANEL ================= */}
    <div className="flex items-center justify-center bg-background px-6">

      <div className="w-full max-w-md">
        <Tabs defaultValue="Student" className="w-full">

          {/* Tabs */}
          <TabsList className="w-full mb-6 grid grid-cols-3">
            <TabsTrigger value="Student">Student</TabsTrigger>
            <TabsTrigger value="Staff">Staff</TabsTrigger>
            <TabsTrigger value="Admin">Admin</TabsTrigger>
          </TabsList>

          {/* ---------------- STUDENT ---------------- */}
          <TabsContent value="Student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription className="space-y-4 mt-4">
                  <Input
                    placeholder="Student Email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                  />

                  <Input
                    type="password"
                    placeholder="Password"
                    value={studentPassword}
                    onChange={(e) =>
                      setStudentPassword(e.target.value)
                    }
                  />

                  <Button className="w-full" onClick={handleStudentLogin}>
                    Login
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
                <CardDescription className="space-y-4 mt-4">
                  <Input
                    placeholder="Staff Email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                  />

                  <Input
                    type="password"
                    placeholder="Password"
                    value={staffPassword}
                    onChange={(e) =>
                      setStaffPassword(e.target.value)
                    }
                  />

                  <Button className="w-full" onClick={handleStaffLogin}>
                    Login
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

                <CardDescription className="space-y-4 mt-4">

                  {isAdminSignup && (
                    <>
                      <Input
                        placeholder="Organisation Name"
                        value={organisationName}
                        onChange={(e) =>
                          setOrganisationName(e.target.value)
                        }
                      />

                      <Input
                        placeholder="Admin Name"
                        value={adminName}
                        onChange={(e) =>
                          setAdminName(e.target.value)
                        }
                      />
                    </>
                  )}

                  <Input
                    placeholder="Admin Email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />

                  <Input
                    type="password"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) =>
                      setAdminPassword(e.target.value)
                    }
                  />

                  {isAdminSignup ? (
                    <Button className="w-full" onClick={handleAdminSignup}>
                      Create Admin Account
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleAdminLogin}>
                      Login
                    </Button>
                  )}

                  <p
                    className="text-sm text-muted-foreground text-center cursor-pointer hover:underline"
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
      </div>
    </div>
  </div>
);

}
