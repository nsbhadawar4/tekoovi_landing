import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
} from "lucide-react";
import type { Blog, Contact } from "@/backend/types";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageSlider } from "@/components/ui/image-slider";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { blogHref, blogImages } from "@/lib/blog";
import { cn } from "@/lib/utils";

/** Blank-line-separated paragraphs; the first gets an editorial drop cap. */
function Article({ text }: { text: string }) {
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {paras.map((p, i) => (
        <p
          key={i}
          className={cn(
            "text-[15px] leading-relaxed text-ink-2 md:text-[17px] md:leading-8",
            i === 0 &&
              "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.7] first-letter:text-brand-3",
          )}
        >
          {p}
        </p>
      ))}
    </>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-3 ring-1 ring-brand-2/30">
      {(name || "T").charAt(0).toUpperCase()}
    </span>
  );
}

export function BlogDetail({
  blog,
  prev,
  next,
  contact,
}: {
  blog: Blog;
  prev?: Blog;
  next?: Blog;
  contact?: Contact;
}) {
  const images = blogImages(blog);
  const tags = blog.tags?.filter(Boolean) ?? [];

  return (
    <article className="relative">
      {/* ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] overflow-hidden"
      >
        <AuroraBlobs className="opacity-35" />
        <GridBackdrop className="opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_60%,var(--color-bg))]" />
      </div>

      {/* ===================== header ===================== */}
      <section className="relative pt-28 pb-8 md:pt-32">
        <Container className="max-w-3xl">
          <Reveal>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              Back to blog
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="mt-8">
              {blog.category && <Badge>{blog.category}</Badge>}
              <h1 className="text-ink-gradient mt-5 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
                {blog.title}
              </h1>

              {/* byline */}
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-white/10 py-5">
                <span className="inline-flex items-center gap-3">
                  <Avatar name={blog.author} />
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold text-ink">
                      {blog.author || "Tekoovi"}
                    </span>
                    <span className="block text-xs text-ink-3">Author</span>
                  </span>
                </span>
                <span className="hidden h-8 w-px bg-white/10 sm:block" />
                {blog.date && (
                  <span className="inline-flex items-center gap-2 text-sm text-ink-3">
                    <CalendarDays className="h-4 w-4 text-brand-3" />
                    {blog.date}
                  </span>
                )}
                {blog.readTime && (
                  <span className="inline-flex items-center gap-2 text-sm text-ink-3">
                    <Clock className="h-4 w-4 text-brand-3" />
                    {blog.readTime}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== slider ===================== */}
      {images.length > 0 && (
        <Container className="max-w-4xl pb-4">
          <Reveal>
            <ImageSlider images={images} alt={blog.title} />
          </Reveal>
        </Container>
      )}

      {/* ===================== body ===================== */}
      <Container className="max-w-3xl py-12 md:py-16">
        <Reveal>
          <div className="flex flex-col gap-6">
            {blog.excerpt && (
              <p className="border-l-2 border-brand-2/60 pl-5 text-lg font-medium leading-relaxed text-ink md:text-xl">
                {blog.excerpt}
              </p>
            )}
            <div className="flex flex-col gap-5">
              <Article text={blog.content} />
            </div>
          </div>
        </Reveal>

        {tags.length > 0 && (
          <Reveal>
            <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink"
                >
                  #{t}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {/* CTA */}
        {contact?.calendly && (
          <Reveal>
            <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-8 text-center md:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"
              />
              <p className="relative font-display text-xl font-semibold text-ink md:text-2xl">
                Building something worth writing about?
              </p>
              <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
                Let&apos;s talk about how we can help you ship it.
              </p>
              <div className="relative mt-6 flex justify-center">
                <Button href={contact.calendly} magnetic withArrow>
                  Book a call
                </Button>
              </div>
            </div>
          </Reveal>
        )}
      </Container>

      {/* ===================== prev / next ===================== */}
      {(prev || next) && (
        <Container className="max-w-4xl pb-24 md:pb-32">
          <div className="grid gap-4 sm:grid-cols-2">
            <BlogNav blog={prev} direction="prev" />
            <BlogNav blog={next} direction="next" />
          </div>
        </Container>
      )}
    </article>
  );
}

function BlogNav({
  blog,
  direction,
}: {
  blog?: Blog;
  direction: "prev" | "next";
}) {
  const isNext = direction === "next";
  if (!blog) return <div className="hidden sm:block" />;

  return (
    <Link
      href={blogHref(blog)}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_60%)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/40",
        isNext && "sm:flex-row-reverse sm:text-right",
      )}
    >
      {/* cover thumb */}
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
        {blog.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(108,59,255,0.4),rgba(20,21,31,0.9))]" />
        )}
      </div>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-3",
            isNext && "sm:flex-row-reverse",
          )}
        >
          {isNext ? (
            <>
              Next <ArrowRight className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </>
          )}
        </span>
        <span className="mt-1 block truncate font-display text-base font-semibold text-ink transition-colors group-hover:text-brand-3">
          {blog.title}
        </span>
      </span>

      <ArrowUpRight
        className={cn(
          "hidden h-4 w-4 shrink-0 text-ink-3 transition-all duration-300 group-hover:text-brand-3 sm:block",
          isNext ? "sm:order-first" : "",
        )}
      />
    </Link>
  );
}
