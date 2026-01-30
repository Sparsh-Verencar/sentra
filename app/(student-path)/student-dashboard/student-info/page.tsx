"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const StudentInfo = () => {
  const student = useQuery(api.students.getCurrentStudent, {});

  if (student === undefined) {
    // still loading
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-60vw h-40vh bg-amber-200 text-2xl text-white flex items-center justify-center">
          Loading...
        </div>
      </div>
    );
  }

  if (student === null) {
    // not logged in or no student record
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="w-60vw h-40vh bg-amber-200 text-2xl text-white flex items-center justify-center">
          No student found
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="w-60vw h-40vh bg-amber-200 text-white p-4 space-y-2">
        <h1 className="text-2xl font-bold">Student Info</h1>
        <p>Name: {student.fname} {student.lname}</p>
        <p>Email: {student.email}</p>
        <p>Department: {student.dept_name}</p>
        <p>Year: {student.year_of_study}</p>
        <p>Phone: {student.phone}</p>
        <p>Address: {student.address}</p>
      </div>
    </div>
  );
};

export default StudentInfo;