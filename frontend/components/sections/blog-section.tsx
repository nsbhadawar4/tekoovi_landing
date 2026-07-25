import type { Blog } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { BlogCard } from "@/components/sections/blog";

/** Landing-page teaser: the latest posts + a link to the full blog. */
export function BlogSection({ blogs }: { blogs: Blog[] }) {
  const latest = blogs.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <Section id="blog" className="bg-bg-2">
      <Container>
        <SectionHeading
          eyebrow="Blog"
          title={<>Insights from the studio</>}
          description="Field notes on design, engineering and shipping AI products — written by the people who build them."
        />

        <RevealGroup
          className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
          stagger={0.07}
        >
          {latest.map((blog) => (
            <RevealItem key={blog.id} className="h-full">
              <BlogCard blog={blog} />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <Button href="/blog" variant="secondary" withArrow>
              Read the blog
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
