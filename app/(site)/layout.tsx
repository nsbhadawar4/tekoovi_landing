import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Preloader } from "@/components/ui/preloader";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const SITE = {
  name: "Tekoovi",
  url: "https://tekoovi.com",
  tagline: "We build digital products that scale businesses.",
  description:
    "Tekoovi is a premium digital product studio. We design and engineer scalable custom websites, SaaS platforms, AI-powered solutions, mobile apps, and automation systems for founders and enterprises.",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  slogan: SITE.tagline,
  areaServed: "Worldwide",
  knowsAbout: [
    "Web Development",
    "SaaS Platforms",
    "Artificial Intelligence",
    "Mobile Applications",
    "Automation",
    "UI/UX Design",
  ],
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <span className="grain" aria-hidden="true" />
      <Preloader />
      <SmoothScroll />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}
