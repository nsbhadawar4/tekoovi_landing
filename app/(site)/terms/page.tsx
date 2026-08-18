import type { Metadata } from "next";
import { getContent } from "@/backend/controllers/content.controller";
import { LegalPage } from "@/components/sections/legal";

// Admin edits must show up immediately, same as the landing page.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { terms } = await getContent();
  return {
    title: terms.title,
    description: terms.intro,
    alternates: { canonical: "/terms" },
    openGraph: { title: terms.title, description: terms.intro },
  };
}

export default async function TermsPage() {
  const content = await getContent();

  return (
    <LegalPage
      eyebrow="Legal"
      meta={content.terms}
      clauses={content.termsClauses}
      contact={content.contact}
    />
  );
}
