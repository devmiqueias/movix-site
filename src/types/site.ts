export interface SiteMeta {
  url: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  shareTitle: string;
  shareDescription: string;
  shareImage: string;
  googleVerification?: string;
  company: string;
}

export interface SiteContact {
  whatsapp: string;
  phoneDisplay: string;
  message: string;
}

export interface SiteHero {
  route: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  lead: string;
  cta: string;
  ctaMessage?: string;
  facts: string[];
  image: string;
  imageAlt: string;
  imageLabel: string;
}

export interface StripItem {
  value: string;
  label: string;
}

export interface DemoProduct {
  name: string;
  price: string;
  unit: string;
}

export interface SiteDemo {
  eyebrow: string;
  title: string;
  intro: string;
  customer: string;
  customerDebt: string;
  customerLimit: string;
  products: DemoProduct[];
}

export interface TourStep {
  id: string;
  key: string;
  exit: string;
  title: string;
  text: string;
  ticks: string[];
  image: string;
  label: string;
  alt: string;
}

export interface GalleryItem {
  image: string;
  caption: string;
  alt: string;
}

export interface SimpleCardItem {
  title: string;
  text: string;
}

export interface PlanItem {
  name: string;
  price?: string;
  period?: string;
  note: string;
  cta: string;
  message: string;
  featured: boolean;
  tag?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SiteContent {
  site: SiteMeta;
  contact: SiteContact;
  hero: SiteHero;
  strip: StripItem[];
  demo?: SiteDemo;
  tour: {
    eyebrow: string;
    title: string;
    intro: string;
    steps: TourStep[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    intro: string;
    items: GalleryItem[];
  };
  security: {
    eyebrow: string;
    title: string;
    intro: string;
    items: SimpleCardItem[];
  };
  audiences: {
    eyebrow: string;
    title: string;
    items: SimpleCardItem[];
  };
  plans: {
    eyebrow: string;
    title: string;
    intro: string;
    items: PlanItem[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  final: {
    title: string;
    text: string;
    cta: string;
  };
  footer: {
    left: string;
    right: string;
  };
}
