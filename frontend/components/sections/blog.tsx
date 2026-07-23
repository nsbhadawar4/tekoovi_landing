import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import type { Blog } from "@/backend/types";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { blogHref } from "@/lib/blog";

export function BlogList({ blogs }: { blogs: Blog[] }) {
  return (
    <article className="relative">
      {/* ambient hero backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden"
      >
        <AuroraBlobs className="opacity-40" />
        <GridBackdrop className="opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_55%,var(--color-bg))]" />
      </div>

      <section className="relative pt-32 pb-10 md:pt-36 md:pb-14">
        <Container className="text-center">
          <Reveal>
            <Badge>Blog</Badge>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-ink-gradient mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Insights from the studio
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-2 md:text-lg">
              Field notes on design, engineering and shipping AI products —
              written by the people who build them.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="pb-24 md:pb-32">
        {blogs.length === 0 ? (
          <div className="card-hairline mx-auto max-w-md rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              No posts yet
            </p>
            <p className="mt-2 text-sm text-ink-2">
              New articles are on the way — check back soon.
            </p>
          </div>
        ) : (
          <RevealGroup
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.07}
          >
            {blogs.map((blog) => (
              <RevealItem key={blog.id} className="h-full">
                <BlogCard blog={blog} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Container>
    </article>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  const tags = blog.tags?.filter(Boolean) ?? [];

  return (
    <Link
      href={blogHref(blog)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_40%)] transition-[transform,border-color,box-shadow] duration-500 ease-out will-change-transform hover:-translate-y-1.5 hover:border-brand-2/40 hover:shadow-[0_34px_80px_-44px_rgba(108,59,255,0.6)]"
    >
      {/* cover */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {blog.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(108,59,255,0.35),rgba(20,21,31,0.9))]" />
            <div className="grid-lines absolute inset-0 opacity-40" />
            <span className="absolute inset-0 grid place-items-center font-display text-[5rem] font-bold leading-none text-white/[0.08]">
              {blog.title.charAt(0)}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"
        />
        {blog.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
            {blog.category}
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
          {blog.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {blog.date}
            </span>
          )}
          {blog.readTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {blog.readTime}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-3">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-xs font-medium text-ink-3">
            {blog.author || "Tekoovi"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
            Read
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
