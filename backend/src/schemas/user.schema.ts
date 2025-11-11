import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const loginSchema = z.object({
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
