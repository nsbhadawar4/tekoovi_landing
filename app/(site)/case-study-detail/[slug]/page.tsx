import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/backend/controllers/content.controller";
import {
  CASE_STUDY_DETAIL_BASE,
  findProject,
  projectSlug,
} from "@/lib/projects";
import { CaseStudyDetail } from "@/components/sections/case-study-detail";

// Projects are admin-editable, so resolve them on every request.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getContent();
  const project = findProject(projects, slug);
  if (!project) return { title: "Case study not found" };

  const title = `${project.name} — Case Study`;
  return {
    title,
    description: project.description,
    alternates: {
      canonical: `${CASE_STUDY_DETAIL_BASE}/${projectSlug(project)}`,
    },
    openGraph: {
      title,
      description: project.description,
      type: "article",
      ...(project.image ? { images: [project.image] } : {}),
    },
  };
}

export default async function CaseStudyDetailPage({ params }: Params) {
  const { slug } = await params;
  const content = await getContent();
  const { projects } = content;

  const index = projects.findIndex(
    (p) => projectSlug(p) === slug || p.id === slug,
  );
  if (index === -1) notFound();

  // Wrap around so the last case study still points somewhere.
  const next =
    projects.length > 1 ? projects[(index + 1) % projects.length] : undefined;

  return (
    <CaseStudyDetail
      project={projects[index]}
      next={next}
      contact={content.contact}
    />
  );
}
