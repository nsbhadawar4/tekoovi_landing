import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import { isHidden, type Blog } from "@/backend/types";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { blogHref } from "@/lib/blog";
import { cn } from "@/lib/utils";

/** Brand-tinted monogram avatar from the author's initial. */
function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-brand/15 font-display text-xs font-bold text-brand-3 ring-1 ring-brand-2/30",
        className,
      )}
    >
      {(name || "T").charAt(0).toUpperCase()}
    </span>
  );
}

function CoverFallback({ title }: { title: string }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(108,59,255,0.35),rgba(20,21,31,0.9))]" />
      <div className="grid-lines absolute inset-0 opacity-40" />
      <span className="absolute inset-0 grid place-items-center font-display text-[5rem] font-bold leading-none text-white/[0.08]">
        {title.charAt(0)}
      </span>
    </div>
  );
}

export function BlogList({ blogs }: { blogs: Blog[] }) {
  const [featured, ...rest] = blogs;

  return (
    <article className="relative">
      {/* ambient hero backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] overflow-hidden"
      >
        <AuroraBlobs className="opacity-40" />
        <GridBackdrop className="opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_55%,var(--color-bg))]" />
      </div>

      <section className="relative pt-32 pb-8 md:pt-36 md:pb-12">
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
          <>
            {featured && (
              <Reveal className="mb-6 sm:mb-8">
                <FeaturedCard blog={featured} />
              </Reveal>
            )}

            {rest.length > 0 && (
              <RevealGroup
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                stagger={0.07}
              >
                {rest.map((blog) => (
                  <RevealItem key={blog.id} className="h-full">
                    <BlogCard blog={blog} />
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </>
        )}
      </Container>
    </article>
  );
}

/* ---------------- featured (horizontal split) ---------------- */
function FeaturedCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={blogHref(blog)}
      className="group relative grid overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_45%)] transition-[transform,border-color,box-shadow] duration-500 ease-out will-change-transform hover:-translate-y-1 hover:border-brand-2/40 hover:shadow-[0_40px_90px_-50px_rgba(108,59,255,0.6)] lg:grid-cols-2"
    >
      {/* cover */}
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
        {blog.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <CoverFallback title={blog.title} />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.14)_50%,transparent_70%)] transition-transform duration-[1100ms] ease-out group-hover:translate-x-full"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_6px_16px_-8px_rgba(108,59,255,0.9)]">
          Featured
        </span>
      </div>

      {/* content */}
      <div className="flex flex-col justify-center gap-4 p-7 sm:p-9 lg:p-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
          {blog.category && (
            <span className="font-semibold uppercase tracking-[0.14em] text-brand-3">
              {blog.category}
            </span>
          )}
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

        {blog.title && (
          <h2 className="text-ink-gradient text-balance font-display text-2xl font-semibold leading-[1.12] sm:text-3xl md:text-4xl">
            {blog.title}
          </h2>
        )}
        {blog.excerpt && (
          <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-2 md:text-base">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          {/* "Tekoovi" stands in for a blank author, so an author switched off
              in the admin has to be checked on the record itself. */}
          {!isHidden(blog, "author") && (
            <span className="inline-flex items-center gap-2.5">
              <Avatar name={blog.author} className="h-9 w-9 text-sm" />
              <span className="text-sm font-medium text-ink-2">
                {blog.author || "Tekoovi"}
              </span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
            Read article
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------- grid card ---------------- */
export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={blogHref(blog)}
      className="group card-lux lift sheen relative flex h-full flex-col overflow-hidden rounded-[24px]"
    >
      {/* cover */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {blog.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.09]"
          />
        ) : (
          <CoverFallback title={blog.title} />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90"
        />
        {blog.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
            {blog.category}
          </span>
        )}
        {blog.readTime && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            <Clock className="h-3 w-3" />
            {blog.readTime}
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        {blog.date && (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
            <CalendarDays className="h-3.5 w-3.5" />
            {blog.date}
          </span>
        )}

        {/* title with an underline that draws itself in on hover */}
        {blog.title && (
          <h3 className="link-underline mt-3 self-start pb-1 font-display text-xl font-semibold leading-snug text-ink">
            {blog.title}
          </h3>
        )}

        {blog.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-6">
          {!isHidden(blog, "author") && (
            <span className="inline-flex items-center gap-2">
              <Avatar name={blog.author} className="h-7 w-7 text-[11px]" />
              <span className="text-xs font-medium text-ink-3">
                {blog.author || "Tekoovi"}
              </span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
            Read
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
