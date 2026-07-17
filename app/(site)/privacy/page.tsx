import type { Metadata } from "next";
import { getContent } from "@/backend/controllers/content.controller";
import { LegalPage } from "@/components/sections/legal";

// Admin edits must show up immediately, same as the landing page.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { privacy } = await getContent();
  return {
    title: privacy.title,
    description: privacy.intro,
    alternates: { canonical: "/privacy" },
    openGraph: { title: privacy.title, description: privacy.intro },
  };
}

export default async function PrivacyPage() {
  const content = await getContent();

  return (
    <LegalPage
      eyebrow="Legal"
      meta={content.privacy}
      clauses={content.privacyClauses}
      contact={content.contact}
    />
  );
}
