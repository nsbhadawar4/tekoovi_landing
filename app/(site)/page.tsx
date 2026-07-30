import { getContent } from "@/backend/controllers/content.controller";
import { isBlockVisible } from "@/backend/types";
import { Hero } from "@/components/sections/hero";
import { TrustedBy } from "@/components/sections/trusted-by";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Services } from "@/components/sections/services";
import { Industries } from "@/components/sections/industries";
import { WhyTekoovi } from "@/components/sections/why-tekoovi";
import { Process } from "@/components/sections/process";
import { TechStack } from "@/components/sections/tech-stack";
import { CaseStudy } from "@/components/sections/case-study";
import { Testimonials } from "@/components/sections/testimonials";
import { Founder } from "@/components/sections/founder";
import { BlogSection } from "@/components/sections/blog-section";
import { FAQ } from "@/components/sections/faq";

// Read fresh content on every request so admin edits show up immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();

  // Every block below is switched from the admin's "Page Sections" panel (and
  // from the toolbar of the section that fills it). Keys come from PAGE_BLOCKS.
  const shows = (block: string) => isBlockVisible(content.pageSections, block);

  return (
    <>
      {shows("hero") && (
        <Hero
          hero={content.hero}
          stats={content.stats}
          testimonials={content.testimonials}
        />
      )}
      {shows("trustedBy") && (
        <TrustedBy stats={content.stats} logos={content.logos} />
      )}
      {shows("work") && <FeaturedProjects projects={content.projects} />}
      {shows("services") && <Services services={content.services} />}
      {shows("industries") && <Industries industries={content.industries} />}
      {shows("why") && <WhyTekoovi why={content.why} />}
      {shows("process") && <Process steps={content.process} />}
      {shows("techStack") && <TechStack techStack={content.techStack} />}
      {shows("caseStudies") && <CaseStudy projects={content.projects} />}
      {shows("testimonials") && (
        <Testimonials testimonials={content.testimonials} />
      )}
      {shows("founder") && (
        <Founder founder={content.founder} socials={content.socials} />
      )}
      {shows("blog") && <BlogSection blogs={content.blogs ?? []} />}
      {shows("faq") && (
        <FAQ faqs={content.faqs} calendly={content.contact.calendly} />
      )}
    </>
  );
}
