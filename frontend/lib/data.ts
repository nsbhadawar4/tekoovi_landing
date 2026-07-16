import {
  Boxes,
  BrainCircuit,
  Building2,
  GraduationCap,
  HeartPulse,
  Landmark,
  LayoutGrid,
  LineChart,
  type LucideIcon,
  Palette,
  Rocket,
  ScanSearch,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Workflow,
  Wrench,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------- */
/*  NAV                                                            */
/* -------------------------------------------------------------- */
export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Studio", href: "#founder" },
  { label: "FAQ", href: "#faq" },
] as const;

/* -------------------------------------------------------------- */
/*  STATS                                                          */
/* -------------------------------------------------------------- */
export const STATS = [
  { value: 140, suffix: "+", label: "Products shipped" },
  { value: 18, suffix: "", label: "Countries served" },
  { value: 9, suffix: "+", label: "Years of craft" },
  { value: 98, suffix: "%", label: "Client satisfaction" },
] as const;

export const MARQUEE_LOGOS = [
  "Aeronex",
  "Northwind",
  "Lumen Health",
  "Kairo",
  "Vaultline",
  "Brightpath",
  "Meridian",
  "Cobalt",
  "Fieldstone",
  "Novus",
];

/* -------------------------------------------------------------- */
/*  FEATURED PROJECTS                                             */
/* -------------------------------------------------------------- */
export type Project = {
  name: string;
  category: string;
  description: string;
  tech: string[];
  country: string;
  result: string;
  accent: string; // gradient stops for the visual
};

export const PROJECTS: Project[] = [
  {
    name: "Lumen Health",
    category: "AI SaaS · Healthcare",
    description:
      "A clinical intelligence platform that turns patient data into real-time care decisions.",
    tech: ["Next.js", "OpenAI", "Supabase", "AWS"],
    country: "United States",
    result: "+63% faster triage",
    accent: "from-[#6C3BFF]/40 to-[#3a1f8f]/10",
  },
  {
    name: "Vaultline",
    category: "Fintech · Platform",
    description:
      "Treasury & payments infrastructure moving eight figures monthly with zero downtime.",
    tech: ["Node.js", "PostgreSQL", "Stripe", "Docker"],
    country: "United Kingdom",
    result: "$40M+ processed",
    accent: "from-[#8A5CFF]/40 to-[#1b1b28]/10",
  },
  {
    name: "Fieldstone",
    category: "PropTech · Web + Mobile",
    description:
      "An end-to-end real estate operating system for listings, tours and closings.",
    tech: ["React Native", "Laravel", "Google Cloud"],
    country: "United Arab Emirates",
    result: "3.4× lead conversion",
    accent: "from-[#B388FF]/35 to-[#241a3d]/10",
  },
  {
    name: "Kairo",
    category: "Automation · Ops",
    description:
      "Workflow automation that replaced 40 hours of manual ops work every week.",
    tech: ["Next.js", "OpenAI", "Firebase"],
    country: "Germany",
    result: "40 hrs/wk saved",
    accent: "from-[#6C3BFF]/35 to-[#0f0f18]/10",
  },
];

/* -------------------------------------------------------------- */
/*  SERVICES                                                       */
/* -------------------------------------------------------------- */
export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
};

export const SERVICES: Service[] = [
  {
    title: "Custom Websites",
    description:
      "Cinematic, conversion-first marketing sites engineered for speed and SEO.",
    icon: LayoutGrid,
    featured: true,
  },
  {
    title: "SaaS Platforms",
    description:
      "Multi-tenant products with billing, auth and dashboards built to scale.",
    icon: Server,
  },
  {
    title: "AI Solutions",
    description:
      "LLM copilots, RAG systems and intelligent agents wired into your product.",
    icon: BrainCircuit,
    featured: true,
  },
  {
    title: "Mobile Apps",
    description: "Native-grade iOS & Android experiences from a single codebase.",
    icon: Smartphone,
  },
  {
    title: "Automation",
    description:
      "Internal tools and workflows that quietly remove operational drag.",
    icon: Workflow,
  },
  {
    title: "UI / UX Design",
    description:
      "Systems, not screens — design languages your team can build on for years.",
    icon: Palette,
  },
  {
    title: "SEO & Growth",
    description:
      "Technical SEO, Core Web Vitals and funnels tuned for compounding growth.",
    icon: LineChart,
  },
  {
    title: "Maintenance",
    description:
      "Proactive monitoring, iteration and long-term partnership after launch.",
    icon: Wrench,
  },
];

/* -------------------------------------------------------------- */
/*  INDUSTRIES                                                     */
/* -------------------------------------------------------------- */
export const INDUSTRIES: { name: string; icon: LucideIcon }[] = [
  { name: "Healthcare", icon: HeartPulse },
  { name: "Real Estate", icon: Building2 },
  { name: "Education", icon: GraduationCap },
  { name: "Construction", icon: Boxes },
  { name: "HRTech", icon: Users },
  { name: "Finance", icon: Landmark },
  { name: "Restaurants", icon: UtensilsCrossed },
  { name: "Retail", icon: ShoppingBag },
];

/* -------------------------------------------------------------- */
/*  WHY TEKOOVI                                                    */
/* -------------------------------------------------------------- */
export const WHY: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Transparent communication",
    description:
      "Direct access to the people building your product. No account managers, no fog.",
    icon: ScanSearch,
  },
  {
    title: "Business-first thinking",
    description:
      "We optimise for your revenue and outcomes, not our line count.",
    icon: LineChart,
  },
  {
    title: "Scalable architecture",
    description:
      "Foundations that hold at 10 users and 10 million — designed from day one.",
    icon: Boxes,
  },
  {
    title: "Fast, deliberate delivery",
    description:
      "Weekly shippable increments. Momentum you can actually see.",
    icon: Rocket,
  },
  {
    title: "Modern technology",
    description:
      "A battle-tested stack chosen for longevity, not hype cycles.",
    icon: Sparkles,
  },
  {
    title: "Long-term partnership",
    description:
      "Most clients stay for years. We build for the roadmap, not the invoice.",
    icon: ShieldCheck,
  },
];

/* -------------------------------------------------------------- */
/*  PROCESS                                                        */
/* -------------------------------------------------------------- */
export const PROCESS: { step: string; title: string; description: string }[] = [
  {
    step: "01",
    title: "Discover",
    description:
      "We dig into your business, users and goals before a single pixel is drawn.",
  },
  {
    step: "02",
    title: "Plan",
    description:
      "Scope, architecture and a clear roadmap with milestones you can hold us to.",
  },
  {
    step: "03",
    title: "Design",
    description:
      "High-fidelity, interactive design systems that feel like the real product.",
  },
  {
    step: "04",
    title: "Develop",
    description:
      "Clean, tested, scalable code shipped in weekly increments you can review.",
  },
  {
    step: "05",
    title: "Test",
    description:
      "QA, performance budgets and accessibility audits before anything goes live.",
  },
  {
    step: "06",
    title: "Launch",
    description:
      "A confident, monitored release — with rollbacks ready if we ever need them.",
  },
  {
    step: "07",
    title: "Support",
    description:
      "We stay on. Iteration, monitoring and growth long after go-live.",
  },
];

/* -------------------------------------------------------------- */
/*  TECH STACK                                                     */
/* -------------------------------------------------------------- */
export const TECH_STACK = [
  "React",
  "Next.js",
  "Laravel",
  "Node.js",
  "React Native",
  "Flutter",
  "Supabase",
  "Firebase",
  "AWS",
  "DigitalOcean",
  "Docker",
  "OpenAI",
  "Stripe",
  "Google Cloud",
  "PostgreSQL",
  "MySQL",
];

/* -------------------------------------------------------------- */
/*  CASE STUDY (spotlight)                                         */
/* -------------------------------------------------------------- */
export const CASE_STUDY = {
  client: "Lumen Health",
  title: "Cutting clinical triage time by two-thirds with an AI care platform",
  problem:
    "Clinicians were drowning in fragmented patient data across five disconnected systems, delaying critical care decisions.",
  research:
    "We shadowed care teams for two weeks, mapped every data source and identified the 12 signals that actually drive triage.",
  solution:
    "A unified, AI-assisted command centre that surfaces the right patient context — and a recommended next action — in real time.",
  tech: ["Next.js", "OpenAI", "Supabase", "AWS", "PostgreSQL"],
  challenges:
    "HIPAA-grade security, sub-200ms inference at the bedside, and a zero-training-required interface for busy staff.",
  metrics: [
    { value: "63%", label: "Faster triage decisions" },
    { value: "4.9/5", label: "Clinician usability score" },
    { value: "0", label: "Critical incidents post-launch" },
    { value: "3 wks", label: "From kickoff to first pilot" },
  ],
};

/* -------------------------------------------------------------- */
/*  TESTIMONIALS                                                   */
/* -------------------------------------------------------------- */
export const TESTIMONIALS = [
  {
    quote:
      "Tekoovi shipped a product our last two agencies couldn't. The quality is genuinely enterprise-grade — it feels like Vercel built it.",
    name: "Sarah Whitfield",
    role: "CEO, Lumen Health",
    initials: "SW",
  },
  {
    quote:
      "They think like founders. Every decision was tied back to revenue and users. Rare, and worth every cent.",
    name: "Daniel Osei",
    role: "Founder, Vaultline",
    initials: "DO",
  },
  {
    quote:
      "Fast, transparent and obsessive about detail. We went from idea to funded pilot in under a month.",
    name: "Amelia Rossi",
    role: "COO, Fieldstone",
    initials: "AR",
  },
  {
    quote:
      "The most senior engineering partner we've worked with. Zero hand-holding, all signal.",
    name: "Marcus Lindqvist",
    role: "CTO, Kairo",
    initials: "ML",
  },
];

/* -------------------------------------------------------------- */
/*  FAQ                                                            */
/* -------------------------------------------------------------- */
export const FAQS = [
  {
    q: "What kind of companies do you work with?",
    a: "Funded startups and established businesses who treat their software as a core asset — not a checkbox. If you care about craft, speed and outcomes, we'll get along.",
  },
  {
    q: "How is Tekoovi different from a typical agency?",
    a: "We're a product studio, not a feature factory. You work directly with senior designers and engineers who own outcomes, communicate transparently and stay for the long term.",
  },
  {
    q: "How long does a typical project take?",
    a: "A focused MVP usually ships in 4–8 weeks. Larger platforms run in weekly increments so you always have something real to review and never wait months in the dark.",
  },
  {
    q: "How much does a project cost?",
    a: "Every engagement is scoped to your goals, so pricing is bespoke. Most partnerships start in the mid five figures. We'll give you a clear, itemised proposal after the discovery call.",
  },
  {
    q: "Do you work after launch?",
    a: "Always. Most clients stay on for ongoing iteration, monitoring and growth. We build for the roadmap, not the invoice.",
  },
  {
    q: "Who actually owns the code and IP?",
    a: "You do — 100%. Clean, documented, well-architected code handed over in your own repositories from day one.",
  },
];

/* -------------------------------------------------------------- */
/*  FOUNDER                                                        */
/* -------------------------------------------------------------- */
export const FOUNDER = {
  name: "Abhay Pratap",
  role: "Founder & Principal Engineer",
  initials: "AP",
  story:
    "I started Tekoovi after a decade of watching brilliant businesses get let down by agencies that shipped templates and disappeared. I wanted to build the opposite: a small, senior studio that treats every product like our own.",
  mission:
    "To give founders and teams the kind of product craft usually reserved for the world's best companies — with the honesty and speed of working directly with the maker.",
  vision:
    "A studio known less for what we build and more for how it performs, scales and lasts — the quiet standard behind ambitious products.",
};

/* -------------------------------------------------------------- */
/*  CONTACT                                                        */
/* -------------------------------------------------------------- */
export const CONTACT = {
  email: "hello@tekoovi.com",
  whatsapp: "https://wa.me/10000000000",
  calendly: "https://calendly.com/tekoovi/discovery",
  socials: [
    { label: "X", href: "https://x.com/tekoovi" },
    { label: "LinkedIn", href: "https://linkedin.com/company/tekoovi" },
    { label: "Dribbble", href: "https://dribbble.com/tekoovi" },
    { label: "GitHub", href: "https://github.com/tekoovi" },
  ],
};

export { Search };
