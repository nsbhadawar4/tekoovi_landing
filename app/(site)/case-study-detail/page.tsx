import type { Metadata } from "next";
import { getContent } from "@/backend/controllers/content.controller";
import { CaseStudyDetail } from "@/components/sections/case-study-detail";

// Content is admin-editable, so resolve it on every request like the rest of
// the site rather than baking it in at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { caseStudy } = await getContent();
  return {
    title: `${caseStudy.title} — Case Study`,
    description: `How we partnered with ${caseStudy.client} — ${caseStudy.outcome}`,
    alternates: { canonical: "/case-study-detail" },
  };
}

export default async function CaseStudyDetailPage() {
  const content = await getContent();
  return (
    <CaseStudyDetail
      caseStudy={content.caseStudy}
      metrics={content.caseMetrics}
      contact={content.contact}
    />
  );
}
