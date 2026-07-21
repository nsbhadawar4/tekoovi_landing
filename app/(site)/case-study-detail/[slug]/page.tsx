import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/backend/controllers/content.controller";
import { CaseStudyDetail } from "@/components/sections/case-study-detail";
import { CASE_STUDY_BASE, findProject, projectSlug } from "@/lib/projects";

// Projects are admin-editable, so resolve them on every request like the rest
// of the site rather than baking them in at build time.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getContent();
  const project = findProject(projects, slug);
  if (!project) return { title: "Case study not found" };

  const title = `${project.name} — ${project.category}`;
  return {
    title,
    description: project.description,
    alternates: { canonical: `${CASE_STUDY_BASE}/${projectSlug(project)}` },
    openGraph: {
      title,
      description: project.description,
      type: "article",
      ...(project.image ? { images: [project.image] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Params) {
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
