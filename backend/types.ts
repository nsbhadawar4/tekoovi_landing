import { FONT_OPTIONS } from "@/lib/fonts";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "icon"
  | "tags"
  | "select"
  | "image";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Optional crop-frame ratio for image fields. */
  aspect?: number;
  /** Image fields: "contain" keeps the whole image visible (logos). */
  fit?: "cover" | "contain";
  /** Optional export width for cropped image fields. */
  outputWidth?: number;
  /** Choices for `select` fields. */
  options?: { value: string; label: string }[];
  /** Optional helper text shown under the field in the admin. */
  hint?: string;
  /** Singleton editors: fields sharing a group id render inside one card. */
  group?: string;
  /**
   * Boolean fields: what an unset value means. A switch the admin has never
   * touched shows (and saves) this, so "on unless turned off" reads correctly.
   */
  default?: boolean;
  /**
   * No show/hide switch for this field. Used for values that aren't content on
   * the page — a link target, a style class — where hiding means nothing. The
   * visible field they belong to (the button label, the card image) carries the
   * switch instead.
   */
  noToggle?: boolean;
}

export type SectionKind = "collection" | "singleton";
export interface HeaderDef {
  key: string;
  label: string;
  singular: string;
  fields: FieldDef[];
}

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
  /** Collection only: a singleton record edited above the list. */
  header?: HeaderDef;
  /** Site-wide controls rather than page content — no show/hide switches. */
  noToggles?: boolean;
  /**
   * Landing-page blocks this section feeds (keys from PAGE_BLOCKS). The admin
   * shows each one's show/hide switch right in this section's toolbar, so a
   * whole block can be turned off from where its content is edited.
   */
  blocks?: string[];
  fields: FieldDef[];
}

/* --------------------- landing-page blocks -------------------- */

/** One switchable block of the landing page. */
export interface PageBlockDef {
  key: string;
  /** Name of the block as a visitor would recognise it. */
  label: string;
  /** What it covers, shown under the switch in the admin. */
  hint: string;
}

/**
 * The landing page, block by block, in render order — this list IS the set of
 * switches in the admin's "Page Sections" panel, and app/(site)/page.tsx renders
 * each block only when its switch is on. Add a block here and to that page
 * together; a key with no stored value counts as shown.
 */
export const PAGE_BLOCKS: PageBlockDef[] = [
  { key: "hero", label: "Hero", hint: "The opening banner, headline and buttons." },
  {
    key: "trustedBy",
    label: "Trusted By",
    hint: "The stats panel and the client logo marquee.",
  },
  {
    key: "work",
    label: "Selected Work",
    hint: "The project card grid (“Products we're proud to have shipped”).",
  },
  { key: "services", label: "Services", hint: "The “What we do” cards." },
  { key: "industries", label: "Industries", hint: "The industry tiles." },
  { key: "why", label: "Why Tekoovi", hint: "The reasons-to-hire-us list." },
  { key: "process", label: "Process", hint: "The “How we work” timeline." },
  { key: "techStack", label: "Tech Stack", hint: "The technology marquee." },
  {
    key: "caseStudies",
    label: "Case Studies",
    hint: "The “Client success stories” cards.",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    hint: "The featured quote and the testimonial grid.",
  },
  {
    key: "founder",
    label: "The Studio",
    hint: "The founder card, story, mission and vision.",
  },
  { key: "blog", label: "Blog", hint: "The latest-posts teaser. /blog stays live." },
  { key: "faq", label: "FAQ", hint: "The question accordion." },
];

/** Switch fields for the Page Sections panel — one per block, on by default. */
const PAGE_BLOCK_FIELDS: FieldDef[] = PAGE_BLOCKS.map((block) => ({
  name: block.key,
  label: block.label,
  type: "boolean",
  hint: block.hint,
  default: true,
  // One card for the whole list — it reads as a single control panel.
  group: "pageBlocks",
}));

const LEGAL_HEADER_FIELDS: FieldDef[] = [
  { name: "title", label: "Page title", type: "text" },
  { name: "intro", label: "Intro paragraph", type: "textarea" },
  {
    name: "updated",
    label: "Last updated",
    type: "text",
    placeholder: "17 July 2026",
  },
];

const LEGAL_CLAUSE_FIELDS: FieldDef[] = [
  { name: "heading", label: "Clause heading", type: "text" },
  {
    name: "body",
    label:
      "Clause body — blank line = new paragraph, line starting with “- ” = bullet",
    type: "textarea",
  },
];

export const SECTIONS: SectionDef[] = [
  {
    key: "settings",
    label: "Settings",
    onPage: "Site-wide appearance",
    kind: "singleton",
    icon: "SlidersHorizontal",
    singular: "Settings",
    // Appearance controls for the whole site, not page content — nothing here
    // gets a show/hide switch.
    noToggles: true,
    fields: [
      {
        name: "logoImage",
        label: "Logo image",
        type: "image",
        aspect: 3,
        fit: "contain",
        outputWidth: 480,
        hint: "Wide lockup (3:1). The whole image stays visible — zoom out to fit it, spare space stays transparent.",
      },
      {
        name: "fontFamily",
        label: "Font family",
        type: "select",
        options: FONT_OPTIONS.map((f) => ({ value: f.value, label: f.label })),
        hint: "Applies to the whole landing page. Changes show on the next page refresh.",
      },
      {
        name: "theme",
        label: "Default theme",
        type: "select",
        group: "theme",
        options: [
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
        ],
        hint: "The colour theme visitors see first. If the header toggle is on, their own choice is remembered afterwards.",
      },
      {
        name: "showThemeToggle",
        label: "Show light/dark toggle in header",
        type: "boolean",
        group: "theme",
        hint: "When on, visitors get a sun/moon button in the header to switch themes themselves.",
      },
    ],
  },
  {
    key: "pageSections",
    label: "Page Sections",
    onPage: "Whole landing page",
    kind: "singleton",
    icon: "LayoutList",
    singular: "Page sections",
    // These switches are the visibility controls themselves.
    noToggles: true,
    fields: PAGE_BLOCK_FIELDS,
  },
  {
    key: "hero",
    label: "Hero",
    onPage: "Top of page",
    kind: "singleton",
    icon: "Sparkles",
    singular: "Hero",
    blocks: ["hero"],
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
      {
        name: "primaryLabel",
        label: "Primary button label",
        type: "text",
        hint: "Switching the label or the link off removes the button.",
      },
      { name: "primaryHref", label: "Primary button link", type: "text" },
      {
        name: "secondaryLabel",
        label: "Secondary button label",
        type: "text",
        hint: "Switching the label or the link off removes the button.",
      },
      { name: "secondaryHref", label: "Secondary button link", type: "text" },
    ],
  },
  {
    key: "stats",
    label: "Stats",
    onPage: "Trusted By",
    kind: "collection",
    icon: "BarChart3",
    singular: "Stat",
    blocks: ["trustedBy"],
    titleField: "label",
    subField: "value",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "value", label: "Value (number)", type: "number" },
      {
        name: "suffix",
        label: "Suffix",
        type: "text",
        placeholder: "+  %  etc.",
      },
    ],
  },
  {
    key: "logos",
    label: "Client Logos",
    onPage: "Trusted By marquee",
    kind: "collection",
    icon: "Building2",
    singular: "Logo",
    blocks: ["trustedBy"],
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
    blocks: ["work", "caseStudies"],
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
        hint: "Only used as the card background when there's no image.",
      },

      {
        name: "year",
        label: "Year",
        type: "text",
        placeholder: "2025",
        hint: "Everything below shows on the case study page only.",
      },
      {
        name: "duration",
        label: "Engagement length",
        type: "text",
        placeholder: "14 weeks",
      },
      { name: "services", label: "Services (comma separated)", type: "tags" },
      {
        name: "gallery1",
        label: "Gallery image 1",
        type: "image",
        aspect: 16 / 10,
        outputWidth: 1600,
        hint: "Optional screenshots shown further down the case study page.",
      },
      {
        name: "gallery2",
        label: "Gallery image 2",
        type: "image",
        aspect: 16 / 10,
        outputWidth: 1600,
      },
      {
        name: "gallery3",
        label: "Gallery image 3",
        type: "image",
        aspect: 16 / 10,
        outputWidth: 1600,
      },
      { name: "overview", label: "Overview", type: "textarea" },
      { name: "challenge", label: "The challenge", type: "textarea" },
      { name: "solution", label: "What we built", type: "textarea" },
      { name: "outcome", label: "The outcome", type: "textarea" },
      {
        name: "highlights",
        label: "Result highlights (comma separated)",
        type: "tags",
        placeholder: "63% faster triage, 4.9 App Store rating",
      },
      { name: "quote", label: "Client quote", type: "textarea" },
      {
        name: "quoteAuthor",
        label: "Quote author",
        type: "text",
        placeholder: "Sara Whitfield, COO",
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
    blocks: ["services"],
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
    blocks: ["industries"],
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
    blocks: ["why"],
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
    blocks: ["process"],
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
    blocks: ["techStack"],
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
    blocks: ["testimonials"],
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
    blocks: ["founder"],
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
    blocks: ["faq"],
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
    onPage: "Footer, legal pages + every Book a call button",
    kind: "singleton",
    icon: "Mail",
    singular: "Contact",
    fields: [
      { name: "email", label: "Email", type: "text" },
      { name: "whatsapp", label: "WhatsApp link", type: "text" },
      {
        name: "calendly",
        label: "Calendly link — every “Book a call” button opens this",
        type: "text",
        hint: "Switching this off removes every “Book a call” button on the site.",
      },
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
      {
        name: "label",
        label: "Label",
        type: "text",
        placeholder: "LinkedIn",
        hint: "Switching the label or the URL off removes this link from the footer and founder card.",
      },
      { name: "href", label: "URL", type: "text" },
    ],
  },
  {
    key: "privacyClauses",
    label: "Privacy Policy",
    onPage: "/privacy",
    kind: "collection",
    icon: "ShieldCheck",
    singular: "Privacy clause",
    titleField: "heading",
    subField: "body",
    header: {
      key: "privacy",
      label: "Page header",
      singular: "Privacy header",
      fields: LEGAL_HEADER_FIELDS,
    },
    fields: LEGAL_CLAUSE_FIELDS,
  },
  {
    key: "termsClauses",
    label: "Terms of Service",
    onPage: "/terms",
    kind: "collection",
    icon: "Scale",
    singular: "Terms clause",
    titleField: "heading",
    subField: "body",
    header: {
      key: "terms",
      label: "Page header",
      singular: "Terms header",
      fields: LEGAL_HEADER_FIELDS,
    },
    fields: LEGAL_CLAUSE_FIELDS,
  },
  {
    key: "blogs",
    label: "Blog",
    onPage: "/blog",
    kind: "collection",
    icon: "Newspaper",
    singular: "Blog post",
    blocks: ["blog"],
    titleField: "title",
    subField: "category",
    fields: [
      {
        name: "coverImage",
        label: "Cover image",
        type: "image",
        aspect: 16 / 9,
        outputWidth: 1600,
        hint: "Shown on the blog card and first in the detail-page slider.",
      },
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "text", placeholder: "Engineering" },
      {
        name: "excerpt",
        label: "Excerpt / summary",
        type: "textarea",
        hint: "One or two lines shown on the blog card.",
      },
      { name: "author", label: "Author", type: "text", placeholder: "Tekoovi Team" },
      { name: "date", label: "Date", type: "text", placeholder: "23 July 2026" },
      { name: "readTime", label: "Read time", type: "text", placeholder: "5 min read" },
      { name: "tags", label: "Tags (comma separated)", type: "tags" },
      {
        name: "content",
        label: "Body — blank line = new paragraph",
        type: "textarea",
      },
      {
        name: "image1",
        label: "Slider image 1",
        type: "image",
        aspect: 16 / 9,
        outputWidth: 1600,
        hint: "The cover + these appear in the detail-page image slider.",
      },
      {
        name: "image2",
        label: "Slider image 2",
        type: "image",
        aspect: 16 / 9,
        outputWidth: 1600,
      },
      {
        name: "image3",
        label: "Slider image 3",
        type: "image",
        aspect: 16 / 9,
        outputWidth: 1600,
      },
    ],
  },
];

/* ----------------------- derived helpers ---------------------- */

/** A header record behaves exactly like a singleton section to the API. */
function headerAsSection(parent: SectionDef, header: HeaderDef): SectionDef {
  return {
    key: header.key,
    label: header.label,
    onPage: parent.onPage,
    kind: "singleton",
    icon: parent.icon,
    singular: header.singular,
    fields: header.fields,
  };
}

/* Every addressable content key. SECTIONS alone drives the sidebar; headers are
   editable through their parent's entry, so they're resolvable but not listed. */
const ALL_SECTIONS: SectionDef[] = [
  ...SECTIONS,
  ...SECTIONS.flatMap((s) => (s.header ? [headerAsSection(s, s.header)] : [])),
];

export const SECTION_KEYS: string[] = ALL_SECTIONS.map((s) => s.key);

const SECTION_MAP: Record<string, SectionDef> = Object.fromEntries(
  ALL_SECTIONS.map((s) => [s.key, s]),
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

/* ---------------------- field visibility ---------------------- */

/**
 * Reserved record key listing the fields switched off in the admin.
 *
 * Every content record may carry it. The public read path (getContent) blanks
 * out those fields, so hidden content is never rendered — and never even
 * reaches the browser. The admin API returns records untouched, so switching a
 * field back on restores the value the admin typed.
 */
export const HIDDEN_FIELDS = "hiddenFields";

/**
 * Is this landing-page block switched on?
 *
 * A key with no stored value counts as shown, so a block added to PAGE_BLOCKS
 * later appears on the page until someone deliberately turns it off.
 */
export function isBlockVisible(
  pageSections: Record<string, boolean> | undefined,
  key: string,
): boolean {
  return pageSections?.[key] !== false;
}

/** A content record that can have some of its fields hidden from the site. */
export interface Hideable {
  /** Field names switched off in the admin. */
  hiddenFields?: string[];
}

/** Does this field get a show/hide switch in the admin? */
export function isToggleable(
  def: { noToggles?: boolean },
  field: FieldDef,
): boolean {
  // A boolean field is already a switch of its own — hiding it would only
  // duplicate what turning it off does.
  return !def.noToggles && !field.noToggle && field.type !== "boolean";
}

/**
 * Is this record's field switched off?
 *
 * Hidden values are blanked on read, so a plain truthiness check is usually
 * enough. Reach for this only where the blank value has a meaning of its own
 * (a fallback avatar, a default author name) and must not be shown either.
 */
export function isHidden(record: Hideable | undefined, field: string): boolean {
  return record?.hiddenFields?.includes(field) ?? false;
}

/* --------------------- content shape types -------------------- */

export interface Hero extends Hideable {
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
}

export interface Stat extends Hideable {
  id: string;
  label: string;
  value: number;
  suffix: string;
}

export interface Logo extends Hideable {
  id: string;
  name: string;
}

export interface Project extends Hideable {
  id: string;
  image: string; // uploaded card image URL ("" = gradient fallback)
  name: string;
  category: string;
  description: string;
  tech: string[];
  country: string;
  result: string;
  accent: string;

  /* Case study page. All optional — a project with none of these still gets a
     page, it just renders the sections it has content for. */
  year?: string;
  duration?: string;
  services?: string[];
  /** Optional extra screenshots for the case study gallery. */
  gallery1?: string;
  gallery2?: string;
  gallery3?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  highlights?: string[];
  quote?: string;
  quoteAuthor?: string;
}

export interface Service extends Hideable {
  id: string;
  title: string;
  description: string;
  icon: string;
  featured: boolean;
}

export interface Industry extends Hideable {
  id: string;
  name: string;
  icon: string;
}

export interface WhyItem extends Hideable {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProcessStep extends Hideable {
  id: string;
  step: string;
  title: string;
  description: string;
}

export interface Tech extends Hideable {
  id: string;
  name: string;
}

export interface CaseStudy extends Hideable {
  client: string;
  title: string;
  problem: string;
  research: string;
  solution: string;
  challenges: string;
  tech: string[];
  outcome: string;
}

export interface CaseMetric extends Hideable {
  id: string;
  value: string;
  label: string;
}

export interface Testimonial extends Hideable {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface Founder extends Hideable {
  name: string;
  role: string;
  initials: string;
  story: string;
  mission: string;
  vision: string;
}

export interface Faq extends Hideable {
  id: string;
  q: string;
  a: string;
}

export interface Contact extends Hideable {
  email: string;
  whatsapp: string;
  calendly: string;
}

export interface Social extends Hideable {
  id: string;
  label: string;
  href: string;
}

/** Header block for a legal page (/privacy, /terms). */
export interface LegalMeta extends Hideable {
  title: string;
  intro: string;
  updated: string;
}

/** One numbered clause on a legal page. */
export interface LegalClause extends Hideable {
  id: string;
  heading: string;
  body: string;
}

/** Site-wide appearance settings, edited from the admin Settings section. */
export interface SiteSettings {
  /** A value from FONT_OPTIONS in @/lib/fonts. */
  fontFamily: string;
  /** Cropped logo stored as a data URL; empty falls back to the default mark. */
  logoImage: string;
  /** Default colour theme for the landing page: "dark" | "light". */
  theme: string;
  /** Show the light/dark toggle icon in the landing-page header. */
  showThemeToggle: boolean;
}

/** A blog post — listed on /blog, opened at /blog/[slug]. */
export interface Blog extends Hideable {
  id: string;
  title: string;
  category: string;
  author: string;
  /** Display date, e.g. "23 July 2026". */
  date: string;
  /** e.g. "5 min read". */
  readTime: string;
  excerpt: string;
  coverImage: string;
  /** Extra images — cover + these feed the detail-page slider. */
  image1?: string;
  image2?: string;
  image3?: string;
  /** Body: blank-line-separated paragraphs. */
  content: string;
  tags: string[];
}

export interface ContentData {
  /** Landing-page blocks switched off in the admin (missing key = shown). */
  pageSections?: Record<string, boolean>;
  settings: SiteSettings;
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
  blogs: Blog[];
  contact: Contact;
  socials: Social[];
  privacy: LegalMeta;
  privacyClauses: LegalClause[];
  terms: LegalMeta;
  termsClauses: LegalClause[];
}

export type ContentItem = { id: string } & Record<string, unknown>;
