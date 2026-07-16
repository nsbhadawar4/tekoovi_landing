import {
  BadgeCheck,
  Boxes,
  BrainCircuit,
  Building2,
  Cloud,
  Code2,
  Cpu,
  Database,
  Gauge,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Layers,
  LayoutGrid,
  LineChart,
  Lock,
  type LucideIcon,
  Palette,
  PenTool,
  Rocket,
  ScanSearch,
  Server,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Users,
  UtensilsCrossed,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------- */
/*  Icon registry.                                                 */
/*  Content is stored with an icon *name* (a string) so it can     */
/*  live in JSON / MongoDB. Here we map that name to a real Lucide  */
/*  component for rendering, and expose the names for the admin     */
/*  icon picker.                                                    */
/* -------------------------------------------------------------- */

export const ICONS: Record<string, LucideIcon> = {
  LayoutGrid,
  Server,
  BrainCircuit,
  Smartphone,
  Workflow,
  Palette,
  LineChart,
  Wrench,
  Rocket,
  ShieldCheck,
  Sparkles,
  ScanSearch,
  Boxes,
  HeartPulse,
  Building2,
  GraduationCap,
  Users,
  Landmark,
  UtensilsCrossed,
  ShoppingBag,
  BadgeCheck,
  Code2,
  Cpu,
  Database,
  Cloud,
  Globe,
  Lock,
  Layers,
  PenTool,
  Gauge,
  Target,
  Zap,
};

/** Names offered in the admin form's icon dropdown. */
export const ICON_NAMES = Object.keys(ICONS);

/** Resolve a stored icon name to a component (falls back to Sparkles). */
export function getIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name]) || Sparkles;
}
