import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, "Email must not exceed 255 characters")
  .email("Enter a valid email address, such as name@example.com");

export const registrationPasswordSchema = z
  .string()
  .min(12, "Password must contain at least 12 characters")
  .max(128, "Password must not exceed 128 characters");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    email: emailSchema,
    password: registrationPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must not exceed 128 characters"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "The reset link is missing").max(2_048),
    newPassword: registrationPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const currencySchema = z.enum([
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "GHS",
  "KES",
  "ZAR",
]);

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: emailSchema,
  currency: currencySchema,
  timezone: z
    .string()
    .trim()
    .min(1, "Select a timezone")
    .max(64, "Timezone is too long")
    .refine(
      (timezone) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
          return true;
        } catch {
          return false;
        }
      },
      { message: "Select a valid IANA timezone" },
    ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(128),
    newPassword: registrationPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
