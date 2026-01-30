// app/Onboarding/page.tsx
"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import Onboardingcontent from "../Onboardingcontent";

export default function OnboardingPage() {
  return (
    <>
      <Authenticated>
        <Onboardingcontent />
      </Authenticated>
      <Unauthenticated>
        <p>Please sign in as admin first.</p>
      </Unauthenticated>
    </>
  );
}