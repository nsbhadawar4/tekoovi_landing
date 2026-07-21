/* -------------------------------------------------------------- */
/*  Project URL helpers.                                            */
/*                                                                  */
/*  A case study lives at /case-study-detail/<slug>. The slug is     */
/*  admin-editable but almost never set, so it falls back to the     */
/*  project name and finally to the id — every project always        */
/*  resolves to a URL.                                               */
/* -------------------------------------------------------------- */

import type { Project } from "@/backend/types";
import { slugify } from "@/lib/utils";

export const CASE_STUDY_BASE = "/case-study-detail";

export function projectSlug(project: Project): string {
  const custom = project.slug?.trim();
  return custom ? slugify(custom, project.id) : slugify(project.name, project.id);
}

export function projectHref(project: Project): string {
  return `${CASE_STUDY_BASE}/${projectSlug(project)}`;
}

/** Match by slug, falling back to the raw id so old links keep working. */
export function findProject(
  projects: Project[],
  slug: string,
): Project | undefined {
  return projects.find((p) => projectSlug(p) === slug || p.id === slug);
}
