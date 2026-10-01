import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Saisis une adresse e-mail valide.")
  .max(255);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Saisis ton mot de passe."),
});

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, "Saisis ton prénom.").max(100),
    last_name: z.string().trim().max(100).optional(),
    email: emailSchema,
    password: z.string().min(8, "8 caractères minimum."),
    password_confirmation: z.string().min(1, "Confirme ton mot de passe."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password_confirmation"],
  });

export const emailSchemaForm = z.object({ email: emailSchema });

export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Le code doit contenir 6 chiffres."),
});

export const resetPasswordSchema = verifyCodeSchema
  .extend({
    password: z.string().min(8, "8 caractères minimum."),
    password_confirmation: z.string().min(1, "Confirme ton mot de passe."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password_confirmation"],
  });

export const profileUpdateSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est obligatoire.").max(100),
  last_name: z.string().trim().max(100),
  phone: z.string().trim().max(30),
  country: z.string().trim().max(120),
  language: z.enum(["fr", "en"]),
  interests: z.array(z.string().max(80)).max(20),
});

export const changeEmailSchema = z.object({
  email: emailSchema,
  current_password: z.string().min(1, "Saisis ton mot de passe actuel."),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Saisis ton mot de passe actuel."),
    password: z.string().min(8, "8 caractères minimum."),
    password_confirmation: z.string().min(1, "Confirme ton mot de passe."),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password_confirmation"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type EmailFormValues = z.infer<typeof emailSchemaForm>;
export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;