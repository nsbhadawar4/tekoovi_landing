import type { Metadata } from "next";
import { getContent } from "@/backend/controllers/content.controller";
import { Button } from "@/components/ui/button";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// The page reads live contact details, so it must be rendered per request —
// otherwise a build with the API unreachable would bake stale content in.
export const dynamic = "force-dynamic";

export default async function NotFound() {
  const { contact } = await getContent();

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6">
      <AuroraBlobs />
      <GridBackdrop />
      <div className="relative z-10 flex flex-col items-center text-center">
        <Badge>Error 404</Badge>
        <h1 className="text-ink-gradient mt-6 font-display text-[26vw] font-bold leading-none tracking-tighter sm:text-[180px]">
          404
        </h1>
        <p className="mt-2 max-w-md text-balance text-lg text-ink-2">
          This page drifted off the roadmap. Let&apos;s get you back to
          something that ships.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/" size="lg" magnetic withArrow>
            Back to home
          </Button>
          {contact.calendly && (
            <Button href={contact.calendly} size="lg" variant="secondary">
              Book a call
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
