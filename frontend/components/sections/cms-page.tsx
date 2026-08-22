import type { PublicPage } from "@/backend/services/public-content.service";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";

/**
 * Renders a CMS page.
 *
 * Uses the same header treatment as the legal pages so an admin-created page
 * looks like it belongs to the site rather than to a different one. The body
 * was sanitised on the way into the database, which is what makes it safe to
 * set here.
 */
export function CmsPage({ page }: { page: PublicPage }) {
  return (
    <article className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden"
      >
        <AuroraBlobs className="opacity-35" />
        <GridBackdrop className="opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_60%,var(--color-bg))]" />
      </div>

      <section className="relative pt-32 pb-10 md:pt-36">
        <Container className="max-w-3xl">
          <Reveal>
            <Badge>Page</Badge>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-ink-gradient mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {page.title}
            </h1>
          </Reveal>
          {page.excerpt && (
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-2 md:text-lg">
                {page.excerpt}
              </p>
            </Reveal>
          )}
        </Container>
      </section>

      {page.featuredImage && (
        <Container className="max-w-4xl pb-4">
          <Reveal>
            <div className="frame-gradient overflow-hidden rounded-[26px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.featuredImage}
                alt={page.title}
                className="w-full rounded-[25px] object-cover"
              />
            </div>
          </Reveal>
        </Container>
      )}

      <Container className="max-w-3xl pb-24 md:pb-32">
        <Reveal>
          <div
            className="prose-cms flex flex-col gap-5 text-[15px] leading-relaxed text-ink-2 md:text-[17px] md:leading-8 [&_a]:text-brand-3 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-brand-2/60 [&_blockquote]:pl-5 [&_blockquote]:text-ink [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-black/40 [&_pre]:p-4 [&_pre]:text-xs [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </Reveal>
      </Container>
    </article>
  );
}
