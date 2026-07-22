import type { Project } from "@/backend/types";
import { slugify } from "@/lib/utils";

export const CASE_STUDY_BASE = "/work-detail";

export function projectSlug(project: Project): string {
  return slugify(project.name, project.id);
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
