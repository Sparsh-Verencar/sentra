"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function StudentContent() {
  const student = useQuery(api.students.getCurrentStudent, {});

  if (student === undefined)
    return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (student === null)
    return <div className="h-screen flex items-center justify-center">No student found</div>;

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[360px] rounded-2xl shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
            {student.fname[0]}
            {student.lname[0]}
          </div>
          <h1 className="text-xl font-semibold">
            {student.fname} {student.lname}
          </h1>
          <p className="text-sm text-muted-foreground">{student.dept_name}</p>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-2 text-sm pt-4">
          <p><span className="font-medium">Email:</span> {student.email}</p>
          <p><span className="font-medium">Year:</span> {student.year_of_study}</p>
          <p><span className="font-medium">Phone:</span> {student.phone}</p>
          <p><span className="font-medium">Address:</span> {student.address}</p>
        </CardContent>
      </Card>
    </div>
  );
}
