import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  UserRound,
} from "lucide-react";
import type { Blog } from "@/backend/types";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ui/image-slider";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { blogHref, blogImages } from "@/lib/blog";
import { cn } from "@/lib/utils";

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p
            key={i}
            className="text-[15px] leading-relaxed text-ink-2 md:text-base"
          >
            {p}
          </p>
        ))}
    </>
  );
}

export function BlogDetail({
  blog,
  prev,
  next,
}: {
  blog: Blog;
  prev?: Blog;
  next?: Blog;
}) {
  const images = blogImages(blog);
  const tags = blog.tags?.filter(Boolean) ?? [];

  return (
    <article className="relative">
      {/* ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden"
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

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-3">
                {blog.author && (
                  <span className="inline-flex items-center gap-2 text-ink-2">
                    <UserRound className="h-4 w-4 text-brand-3" />
                    {blog.author}
                  </span>
                )}
                {blog.date && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {blog.date}
                  </span>
                )}
                {blog.readTime && (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
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
          <div className="flex flex-col gap-5">
            {blog.excerpt && (
              <p className="text-lg font-medium leading-relaxed text-ink md:text-xl">
                {blog.excerpt}
              </p>
            )}
            <Paragraphs text={blog.content} />
          </div>
        </Reveal>

        {tags.length > 0 && (
          <Reveal>
            <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-8">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2"
                >
                  #{t}
                </span>
              ))}
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
        "group card-hairline flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-white/15",
        isNext && "sm:flex-row-reverse sm:text-right",
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink transition-all duration-300 group-hover:border-brand-2/40 group-hover:bg-brand group-hover:text-white">
        {isNext ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ArrowLeft className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          {isNext ? "Next article" : "Previous article"}
        </span>
        <span className="mt-1 block truncate font-display text-base font-semibold text-ink transition-colors group-hover:text-brand-3">
          {blog.title}
        </span>
      </span>
    </Link>
  );
}
