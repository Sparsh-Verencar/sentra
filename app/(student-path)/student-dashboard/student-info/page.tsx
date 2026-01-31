// app/Onboarding/page.tsx
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import StudentContent from "../../studentcontent";

export default function StudentInfo() {
  return (
    <>
      <Authenticated>
        <StudentContent />
      </Authenticated>
      <Unauthenticated>
        <p>Please sign in as admin first.</p>
      </Unauthenticated>
    </>
  );
}