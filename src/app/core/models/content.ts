export interface NavLink { label: string; anchor: string; }

export interface Stat { value: string; label: string; }

export interface Branch {
  name: string;
  cover: string;
  photos: string[];
  address: string;
  phone: string;
  whatsapp: string;
  hours: string[];
}

export interface MethodCard { title: string; body: string; }

export interface Program {
  id: string;
  flag: string;
  name: string;
  body: string;
  tags: string[];
}

export interface Certification { badge: string; name: string; body: string; scope: string; }

export interface Testimonial { quote: string; author: string; meta: string; }

export interface FaqItem { q: string; a: string; }

export interface Contact {
  address: string[];
  phone: string;
  hours: string[];
  whatsapp: string;
}

export interface SiteContent {
  nav: NavLink[];
  hero: { kicker: string; title: string; titleAccent: string; subtitle: string; ctaPrimary: string; ctaSecondary: string; video: string; };
  stats: Stat[];
  campus: { eyebrow: string; title: string; lede: string; branches: Branch[]; };
  method: { eyebrow: string; title: string; lede: string; cards: MethodCard[]; mcer: string; };
  programs: { eyebrow: string; title: string; lede: string; items: Program[]; };
  certifications: { eyebrow: string; title: string; lede: string; items: Certification[]; };
  testimonials: { eyebrow: string; title: string; items: Testimonial[]; };
  contact: { eyebrow: string; title: string; info: Contact; };
  faq: { eyebrow: string; title: string; items: FaqItem[]; };
  urgency: { kicker: string; title: string; body: string; cta: string; };
}
