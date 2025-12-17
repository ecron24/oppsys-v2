// apps/website/next-env.d.ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

// apps/website/src/types/index.ts
export interface User {
  id: string;
  email: string;
  full_name?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface Plan {
  id: string;
  name: string;
  price: number | string;
  lookup_key: string;
  popular?: boolean;
  features: Feature[];
  priceId?: string;
}

export interface Feature {
  text: string;
  included: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  plan: string;
  lookup_key: string;
}
