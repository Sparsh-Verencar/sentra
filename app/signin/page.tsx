"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
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

export default function Staff_and_Students_Login() {
  const router = useRouter();

  const [isAdminSignup, setIsAdminSignup] = useState(false);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* LEFT IMAGE / BRANDING */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-grey-600 to-purple-700 p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold">Sentra</h1>
          <p className="mt-2 text-white/80">
            Smart hostel management made simple
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-semibold leading-tight">
            Manage students, staff, and issues — all in one place.
          </h2>
          <p className="text-white/80 max-w-md">
            Built for modern hostels with real-time issue tracking,
            role-based access, and powerful administration tools.
          </p>
        </div>

        <p className="text-sm text-white/60">
          © 2026 Sentra
        </p>
      </div>

      {/* RIGHT AUTH FORM */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              Welcome back
            </CardTitle>
            <CardDescription>
              Login or create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="Student">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="Student">Student</TabsTrigger>
                <TabsTrigger value="Staff">Staff</TabsTrigger>
                <TabsTrigger value="Admin">Admin</TabsTrigger>
              </TabsList>

              {/* STUDENT */}
              <TabsContent value="Student">
                <div className="space-y-4">
                  <Input placeholder="Student Email" />
                  <Input type="password" placeholder="Password" />
                  <Button className="w-full">
                    Login as Student
                  </Button>
                </div>
              </TabsContent>

              {/* STAFF */}
              <TabsContent value="Staff">
                <div className="space-y-4">
                  <Input placeholder="Staff Email" />
                  <Input type="password" placeholder="Password" />
                  <Button className="w-full">
                    Login as Staff
                  </Button>
                </div>
              </TabsContent>

              {/* ADMIN */}
              <TabsContent value="Admin">
                <div className="space-y-4">
                  {isAdminSignup && (
                    <>
                      <Input placeholder="Organisation Name" />
                      <Input placeholder="Admin Name" />
                    </>
                  )}

                  <Input placeholder="Admin Email" />
                  <Input type="password" placeholder="Password" />

                  <Button className="w-full">
                    {isAdminSignup
                      ? "Create Admin Account"
                      : "Login as Admin"}
                  </Button>

                  <p
                    className="text-sm text-muted-foreground text-center cursor-pointer hover:underline"
                    onClick={() =>
                      setIsAdminSignup(!isAdminSignup)
                    }
                  >
                    {isAdminSignup
                      ? "Already have an account? Login"
                      : "First time here? Create admin account"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
