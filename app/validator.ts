import { z } from "zod";

/* ---------------- STUDENT SCHEMA ---------------- */

export const studentSchema = z.object({
  fname: z
    .string()
    .min(2, "First name must be at least 2 characters"),

  lname: z
    .string()
    .min(2, "Last name must be at least 2 characters"),

  date_of_birth: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of Birth must be in YYYY-MM-DD format"
    ),

  // Gender cannot be edited manually
  gender: z.enum(["male", "female"]),

  dept_name: z
    .string()
    .min(2, "Department name is required"),

  year_of_study: z
    .string()
    .min(1, "Year of study is required"),

  phone: z
    .string()
    .regex(/^\d+$/, "Phone must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),

  email: z
    .email("Invalid email format"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters"),

  student_password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ---------------- STAFF SCHEMA ---------------- */

export const staffSchema = z.object({
  fname: z
    .string()
    .min(2, "First name must be at least 2 characters"),

  lname: z
    .string()
    .min(2, "Last name must be at least 2 characters"),

  gender: z.enum(["male", "female"]),

  phone: z
    .string()
    .regex(/^\d+$/, "Phone must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),

  email: z
    .email("Invalid email format"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters"),

  staff_password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});
