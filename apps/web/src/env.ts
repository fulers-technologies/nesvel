import { z } from 'zod';

const envSchema = z.object({
  // Public env vars (available in browser)
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Nesvel'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),

  // Server-only env vars
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_SECRET_KEY: z.string().optional(),

  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  NEXT_PUBLIC_ENABLE_ERROR_TRACKING: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

const envServerSchema = envSchema.extend({
  // Add server-only specific validations here
});

const envClientSchema = envSchema.pick({
  NEXT_PUBLIC_APP_URL: true,
  NEXT_PUBLIC_APP_NAME: true,
  NEXT_PUBLIC_API_URL: true,
  NEXT_PUBLIC_ENABLE_ANALYTICS: true,
  NEXT_PUBLIC_ENABLE_ERROR_TRACKING: true,
});

type EnvSchemaType = z.infer<typeof envSchema>;

const processEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
  API_SECRET_KEY: process.env.API_SECRET_KEY,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_ENABLE_ERROR_TRACKING: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING,
};

// Validate env on build
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

// Type-safe env access
export type Env = EnvSchemaType;

// Client-side validation (only public vars)
export const validateClientEnv = () => {
  const clientParsed = envClientSchema.safeParse(processEnv);
  if (!clientParsed.success) {
    console.error('❌ Invalid client environment variables');
  }
  return clientParsed.success;
};
