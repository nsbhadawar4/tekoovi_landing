import { getContent } from "@/backend/controllers/content.controller";
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
import { FAQ } from "@/components/sections/faq";

// Read fresh content on every request so admin edits show up immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  const { calendly } = content.contact;

  return (
    <>
      <Hero hero={content.hero} />
      <TrustedBy stats={content.stats} logos={content.logos} />
      <FeaturedProjects projects={content.projects} />
      <Services services={content.services} />
      <Industries industries={content.industries} />
      <WhyTekoovi why={content.why} />
      <Process steps={content.process} />
      <TechStack techStack={content.techStack} />
      <CaseStudy
        caseStudy={content.caseStudy}
        metrics={content.caseMetrics}
        calendly={calendly}
      />
      <Testimonials testimonials={content.testimonials} />
      <Founder founder={content.founder} socials={content.socials} />
      <FAQ faqs={content.faqs} />
    </>
  );
}
