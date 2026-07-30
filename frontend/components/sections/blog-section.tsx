import type { Blog } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { BlogCard } from "@/components/sections/blog";

/** Landing-page teaser: the latest posts + a link to the full blog. */
export function BlogSection({ blogs }: { blogs: Blog[] }) {
  const latest = blogs.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <Section id="blog" className="relative overflow-hidden bg-bg-2">
      <div
        aria-hidden
        className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-60"
      />

      <Container className="relative">
        <SectionHeading
          align="left"
          eyebrow="Blog"
          title={<>Insights from the studio</>}
          description="Field notes on design, engineering and shipping AI products — written by the people who build them."
          action={
            <Button href="/blog" variant="secondary" withArrow>
              Read the blog
            </Button>
          }
        />

        <RevealGroup
          className="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          stagger={0.07}
        >
          {latest.map((blog) => (
            <RevealItem key={blog.id} className="h-full">
              <BlogCard blog={blog} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
