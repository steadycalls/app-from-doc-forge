export const ORGANIZATION_SLUGS = {
  SITEPANDA: 'sitepanda',
  DECISIONS_UNLIMITED: 'decisions-unlimited',
  LOGIC_INBOUND: 'logic-inbound',
} as const;

export const ORGANIZATION_CONFIG = {
  [ORGANIZATION_SLUGS.SITEPANDA]: {
    name: 'SitePanda',
    slug: ORGANIZATION_SLUGS.SITEPANDA,
    domain: 'sitepanda.com',
    primaryColor: '#10b981', // emerald-500
    icon: '🐼',
    tagline: 'SEO & Web Development Excellence',
    features: {
      seo: true,
      crm: true,
      projects: true,
      webhooks: true,
    },
  },
  [ORGANIZATION_SLUGS.DECISIONS_UNLIMITED]: {
    name: 'Decisions Unlimited',
    slug: ORGANIZATION_SLUGS.DECISIONS_UNLIMITED,
    domain: 'decisionsunlimited.com',
    primaryColor: '#3b82f6', // blue-500
    icon: '🎯',
    tagline: 'Strategic Decision Support',
    features: {
      seo: false,
      crm: true,
      projects: true,
      webhooks: true,
    },
  },
  [ORGANIZATION_SLUGS.LOGIC_INBOUND]: {
    name: 'Logic Inbound',
    slug: ORGANIZATION_SLUGS.LOGIC_INBOUND,
    domain: 'logicinbound.com',
    primaryColor: '#8b5cf6', // violet-500
    icon: '🚀',
    tagline: 'Inbound Marketing Solutions',
    features: {
      seo: false,
      crm: true,
      projects: true,
      webhooks: true,
    },
  },
} as const;

export type OrganizationSlug = typeof ORGANIZATION_SLUGS[keyof typeof ORGANIZATION_SLUGS];

export const getOrganizationConfig = (slug: string) => {
  return ORGANIZATION_CONFIG[slug as OrganizationSlug];
};

export const detectOrganizationFromDomain = (hostname: string): OrganizationSlug | null => {
  for (const [, config] of Object.entries(ORGANIZATION_CONFIG)) {
    if (config.domain && hostname.includes(config.domain)) {
      return config.slug as OrganizationSlug;
    }
  }
  return null;
};
