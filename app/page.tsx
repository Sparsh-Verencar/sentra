"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Router from "next/router";




const Dashypage = () => {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter()
  return (
    <>
      <center>
        <h1>welcome to dashboard</h1>
        <Button onClick={()=>router.push("/dashboard")}>Shadcn button</Button>
        <ModeToggle/>
      </center>
    </>
  )
}

export default Dashypage

