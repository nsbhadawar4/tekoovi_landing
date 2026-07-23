import type { Project } from "@/backend/types";
import { slugify } from "@/lib/utils";

export const CASE_STUDY_BASE = "/work-detail";
export const CASE_STUDY_DETAIL_BASE = "/case-study-detail";

export function projectSlug(project: Project): string {
  return slugify(project.name, project.id);
}

/** Link to the project's "Selected Work" detail page. */
export function projectHref(project: Project): string {
  return `${CASE_STUDY_BASE}/${projectSlug(project)}`;
}

/** Link to the project's dedicated case-study detail page (own UI). */
export function caseStudyDetailHref(project: Project): string {
  return `${CASE_STUDY_DETAIL_BASE}/${projectSlug(project)}`;
}

/** Match by slug, falling back to the raw id so old links keep working. */
export function findProject(
  projects: Project[],
  slug: string,
): Project | undefined {
  return projects.find((p) => projectSlug(p) === slug || p.id === slug);
}
