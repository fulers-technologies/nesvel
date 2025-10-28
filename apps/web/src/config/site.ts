import { env } from '@/env';

export const siteConfig = {
  name: 'Nesvel',
  description: 'Enterprise-level Next.js application',
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
  links: {
    twitter: 'https://twitter.com/nesvel',
    github: 'https://github.com/nesvel',
  },
  creator: {
    name: 'Nesvel Team',
    url: env.NEXT_PUBLIC_APP_URL,
  },
} as const;

export type SiteConfig = typeof siteConfig;
