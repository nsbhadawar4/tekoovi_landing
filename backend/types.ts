/* -------------------------------------------------------------- */
/*  Shared content types + the single source of truth for every    */
/*  editable section on the landing page.                          */
/*                                                                  */
/*  Safe to import from server AND client — this file holds only    */
/*  types + plain data (no server-only modules). The admin panel,   */
/*  API routes, controller and repository are all driven by the     */
/*  SECTIONS registry below, so adding a new editable section is    */
/*  a data change here (plus its content in content.json).          */
/* -------------------------------------------------------------- */

/* ------------------------- field model ------------------------ */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "icon"
  | "tags" // comma-separated -> string[]
  | "image"; // upload + crop -> stored image URL

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Optional crop-frame ratio for image fields. */
  aspect?: number;
  /** Optional export width for cropped image fields. */
  outputWidth?: number;
}

/** A section is either a list of items (CRUD) or a single record (edit only). */
export type SectionKind = "collection" | "singleton";

export interface SectionDef {
  key: string;
  /** Shown in the admin sidebar — matches the on-page section. */
  label: string;
  /** Which landing-page block this maps to (sidebar sub-label). */
  onPage: string;
  kind: SectionKind;
  /** Lucide icon name for the sidebar (resolved in the dashboard). */
  icon: string;
  /** Singular noun for toasts, e.g. "Project added". */
  singular: string;
  /** Collection only: which field is the row title / subtitle. */
  titleField?: string;
  subField?: string;
  fields: FieldDef[];
}

/* --------------------- the section registry ------------------- */
/*  Order = top-to-bottom order of the landing page.               */

export const SECTIONS: SectionDef[] = [
  {
    key: "hero",
    label: "Hero",
    onPage: "Top of page",
    kind: "singleton",
    icon: "Sparkles",
    singular: "Hero",
    fields: [
      {
        name: "backgroundImage",
        label: "Background banner image",
        type: "image",
        aspect: 16 / 9,
        outputWidth: 1920,
      },
      { name: "badge", label: "Badge text", type: "text" },
      { name: "titleLead", label: "Headline — lead", type: "text" },
      { name: "titleHighlight", label: "Headline — highlight", type: "text" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "primaryLabel", label: "Primary button label", type: "text" },
      { name: "primaryHref", label: "Primary button link", type: "text" },
      { name: "secondaryLabel", label: "Secondary button label", type: "text" },
      { name: "secondaryHref", label: "Secondary button link", type: "text" },
      { name: "note", label: "Trust note", type: "text" },
    ],
  },
  {
    key: "stats",
    label: "Stats",
    onPage: "Trusted By",
    kind: "collection",
    icon: "BarChart3",
    singular: "Stat",
    titleField: "label",
    subField: "value",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value (number)", type: "number" },
      { name: "suffix", label: "Suffix", type: "text", placeholder: "+  %  etc." },
    ],
  },
  {
    key: "logos",
    label: "Client Logos",
    onPage: "Trusted By marquee",
    kind: "collection",
    icon: "Building2",
    singular: "Logo",
    titleField: "name",
    subField: "",
    fields: [{ name: "name", label: "Company name", type: "text" }],
  },
  {
    key: "projects",
    label: "Projects",
    onPage: "Selected Work",
    kind: "collection",
    icon: "FolderKanban",
    singular: "Project",
    titleField: "name",
    subField: "category",
    fields: [
      { name: "image", label: "Card image", type: "image" },
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "tech", label: "Tech (comma separated)", type: "tags" },
      { name: "country", label: "Country", type: "text" },
      { name: "result", label: "Result badge", type: "text" },
      {
        name: "accent",
        label: "Accent (Tailwind gradient classes)",
        type: "text",
        placeholder: "from-[#6C3BFF]/40 to-[#3a1f8f]/10",
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    onPage: "What we do",
    kind: "collection",
    icon: "Wrench",
    singular: "Service",
    titleField: "title",
    subField: "description",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "featured", label: "Highlight this service", type: "boolean" },
    ],
  },
  {
    key: "industries",
    label: "Industries",
    onPage: "Industries",
    kind: "collection",
    icon: "Factory",
    singular: "Industry",
    titleField: "name",
    subField: "",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "icon", label: "Icon", type: "icon" },
    ],
  },
  {
    key: "why",
    label: "Why Tekoovi",
    onPage: "Why Tekoovi",
    kind: "collection",
    icon: "BadgeCheck",
    singular: "Reason",
    titleField: "title",
    subField: "description",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "icon", label: "Icon", type: "icon" },
    ],
  },
  {
    key: "process",
    label: "Process",
    onPage: "How we work",
    kind: "collection",
    icon: "Workflow",
    singular: "Step",
    titleField: "title",
    subField: "description",
    fields: [
      { name: "step", label: "Step number", type: "text", placeholder: "01" },
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "techStack",
    label: "Tech Stack",
    onPage: "Technology",
    kind: "collection",
    icon: "Code2",
    singular: "Technology",
    titleField: "name",
    subField: "",
    fields: [{ name: "name", label: "Technology name", type: "text" }],
  },
  {
    key: "caseStudy",
    label: "Case Study",
    onPage: "Case Study",
    kind: "singleton",
    icon: "FileText",
    singular: "Case study",
    fields: [
      { name: "client", label: "Client", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      { name: "problem", label: "Problem", type: "textarea" },
      { name: "research", label: "Research", type: "textarea" },
      { name: "solution", label: "Solution", type: "textarea" },
      { name: "challenges", label: "Challenges", type: "textarea" },
      { name: "tech", label: "Tech (comma separated)", type: "tags" },
      { name: "outcome", label: "Outcome statement", type: "textarea" },
    ],
  },
  {
    key: "caseMetrics",
    label: "Case Metrics",
    onPage: "Case Study — metrics",
    kind: "collection",
    icon: "TrendingUp",
    singular: "Metric",
    titleField: "value",
    subField: "label",
    fields: [
      { name: "value", label: "Value", type: "text", placeholder: "63%" },
      { name: "label", label: "Label", type: "text" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    onPage: "Testimonials",
    kind: "collection",
    icon: "MessageSquareQuote",
    singular: "Testimonial",
    titleField: "name",
    subField: "role",
    fields: [
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "initials", label: "Initials", type: "text", placeholder: "SW" },
    ],
  },
  {
    key: "founder",
    label: "Founder",
    onPage: "The Studio",
    kind: "singleton",
    icon: "UserRound",
    singular: "Founder",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "initials", label: "Initials", type: "text", placeholder: "AP" },
      { name: "story", label: "Story", type: "textarea" },
      { name: "mission", label: "Mission", type: "textarea" },
      { name: "vision", label: "Vision", type: "textarea" },
    ],
  },
  {
    key: "faqs",
    label: "FAQ",
    onPage: "FAQ",
    kind: "collection",
    icon: "HelpCircle",
    singular: "FAQ",
    titleField: "q",
    subField: "a",
    fields: [
      { name: "q", label: "Question", type: "text" },
      { name: "a", label: "Answer", type: "textarea" },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    onPage: "Final CTA + footer",
    kind: "singleton",
    icon: "Mail",
    singular: "Contact",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "email", label: "Email", type: "text" },
      { name: "whatsapp", label: "WhatsApp link", type: "text" },
      { name: "calendly", label: "Calendly link", type: "text" },
    ],
  },
  {
    key: "socials",
    label: "Socials",
    onPage: "Footer + founder",
    kind: "collection",
    icon: "Share2",
    singular: "Social link",
    titleField: "label",
    subField: "href",
    fields: [
      { name: "label", label: "Label", type: "text", placeholder: "LinkedIn" },
      { name: "href", label: "URL", type: "text" },
    ],
  },
];

/* ----------------------- derived helpers ---------------------- */

export const SECTION_KEYS: string[] = SECTIONS.map((s) => s.key);

const SECTION_MAP: Record<string, SectionDef> = Object.fromEntries(
  SECTIONS.map((s) => [s.key, s]),
);

export function getSection(key: string): SectionDef | undefined {
  return SECTION_MAP[key];
}

export function isSectionKey(key: string): boolean {
  return key in SECTION_MAP;
}

export function isSingleton(key: string): boolean {
  return SECTION_MAP[key]?.kind === "singleton";
}

/* --------------------- content shape types -------------------- */

export interface Hero {
  /** Cropped hero banner stored as a data URL; empty keeps the visual fallback. */
  backgroundImage: string;
  badge: string;
  titleLead: string;
  titleHighlight: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  note: string;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
}

export interface Logo {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  image: string; // uploaded card image URL ("" = gradient fallback)
  name: string;
  category: string;
  description: string;
  tech: string[];
  country: string;
  result: string;
  accent: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  featured: boolean;
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
}

export interface WhyItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProcessStep {
  id: string;
  step: string;
  title: string;
  description: string;
}

export interface Tech {
  id: string;
  name: string;
}

export interface CaseStudy {
  client: string;
  title: string;
  problem: string;
  research: string;
  solution: string;
  challenges: string;
  tech: string[];
  outcome: string;
}

export interface CaseMetric {
  id: string;
  value: string;
  label: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface Founder {
  name: string;
  role: string;
  initials: string;
  story: string;
  mission: string;
  vision: string;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
}

export interface Contact {
  eyebrow: string;
  title: string;
  subtitle: string;
  email: string;
  whatsapp: string;
  calendly: string;
}

export interface Social {
  id: string;
  label: string;
  href: string;
}

export interface ContentData {
  hero: Hero;
  stats: Stat[];
  logos: Logo[];
  projects: Project[];
  services: Service[];
  industries: Industry[];
  why: WhyItem[];
  process: ProcessStep[];
  techStack: Tech[];
  caseStudy: CaseStudy;
  caseMetrics: CaseMetric[];
  testimonials: Testimonial[];
  founder: Founder;
  faqs: Faq[];
  contact: Contact;
  socials: Social[];
}

export type ContentItem = { id: string } & Record<string, unknown>;
