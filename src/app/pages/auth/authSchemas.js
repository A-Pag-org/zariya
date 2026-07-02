import { z } from "zod";
import { ROLE_LIST } from "../../../core/authz";

const roleIds = ROLE_LIST.map((role) => role.id);

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional()
});

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    mobile: z
      .string()
      .trim()
      .min(1, "Mobile number is required.")
      .regex(/^[\d\s+-]{10,17}$/, "Enter a valid mobile number (10–15 digits)."),
    role: z.string().refine((value) => roleIds.includes(value), "Select the role you are requesting."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });
