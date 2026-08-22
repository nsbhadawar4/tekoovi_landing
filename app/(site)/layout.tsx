import type { CSSProperties } from "react";
import { getContent } from "@/backend/controllers/content.controller";
import { getMenu } from "@/backend/services/public-content.service";
import { visibleNavLinks } from "@/lib/data";
import { DEFAULT_FONT, getFont } from "@/lib/fonts";
import { normalizeTheme, themeInitScript } from "@/lib/theme";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Preloader } from "@/components/ui/preloader";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { CtaBand } from "@/components/ui/cta-band";
import { StickyCta } from "@/components/ui/sticky-cta";

// Footer content is admin-editable, so render on every request.
export const dynamic = "force-dynamic";

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

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Menus are CMS-managed; each falls back to the built-in list until one is
  // saved, so the header and footer are never empty.
  const [content, headerMenu, footerMenu] = await Promise.all([
    getContent(),
    getMenu("header"),
    getMenu("footer"),
  ]);

  // Admin-selectable site font. The default keeps the designed Inter/Jakarta
  // look untouched; any other choice overrides both the body and heading font
  // variables for the whole site subtree, so the change is visible everywhere.
  const font = getFont(content.settings?.fontFamily);
  const applyFont = font.value !== DEFAULT_FONT;
  const fontStyle = applyFont
    ? ({
        fontFamily: font.stack,
        "--font-sans": font.stack,
        "--font-display": font.stack,
      } as CSSProperties)
    : undefined;

  // Admin-selectable default theme + whether visitors get a header toggle.
  const defaultTheme = normalizeTheme(content.settings?.theme);
  const showThemeToggle = content.settings?.showThemeToggle !== false;

  return (
    <div style={fontStyle}>
      {/* No-flash theme: applied on <html> before the page below paints. */}
      <script
        dangerouslySetInnerHTML={{
          __html: themeInitScript(defaultTheme, showThemeToggle),
        }}
      />
      {applyFont && font.href && (
        <link rel="stylesheet" href={font.href} />
      )}
      <span className="grain" aria-hidden="true" />
      <Preloader logoImage={content.settings?.logoImage} />
      <SmoothScroll />
      <Navbar
        calendly={content.contact.calendly}
        logoImage={content.settings?.logoImage}
        showThemeToggle={showThemeToggle}
        links={visibleNavLinks(content.pageSections, headerMenu)}
      />
      <main>{children}</main>
      {/* Closing conversion panel — shows on every page that has somewhere to
          send people; both halves come from the admin Contact section. */}
      <CtaBand
        calendly={content.contact.calendly}
        email={content.contact.email}
      />
      <Footer
        contact={content.contact}
        socials={content.socials}
        services={content.services}
        logoImage={content.settings?.logoImage}
        pageSections={content.pageSections}
        menuItems={footerMenu}
      />
      <StickyCta calendly={content.contact.calendly} />
      <BackToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </div>
  );
}
