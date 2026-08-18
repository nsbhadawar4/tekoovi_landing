import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import {
  isBlockVisible,
  type Contact,
  type Service,
  type Social,
} from "@/backend/types";
import { visibleNavLinks } from "@/lib/data";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";

export function Footer({
  contact,
  socials,
  services,
  logoImage,
  pageSections,
}: {
  contact: Contact;
  socials: Social[];
  services: Service[];
  logoImage?: string;
  /** Landing-page blocks switched on/off in the admin. */
  pageSections?: Record<string, boolean>;
}) {
  const year = new Date().getFullYear();

  // Footer links point at landing-page anchors, so a section switched off in
  // the admin takes its links with it rather than leaving a dead jump.
  const navLinks = visibleNavLinks(pageSections);
  const showWorkLink = isBlockVisible(pageSections, "work");
  const showServices = isBlockVisible(pageSections, "services");

  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-2 pt-16 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full bg-brand/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-50"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-24 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
      />
      <Container className="relative">
        <div className="grid gap-10 pb-12 sm:gap-12 sm:pb-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo logoImage={logoImage} />
            <p className="mt-5 text-sm leading-relaxed text-ink-2">
              A premium digital product studio building scalable websites, SaaS,
              AI and mobile products for ambitious founders and teams.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials
                .filter((s) => s.label && s.href)
                .map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/40 hover:bg-brand/10 hover:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
            </div>
          </div>

          <FooterCol title="Navigate">
            {navLinks.map((l) => (
              <FooterLink key={l.href} href={`/${l.href}`}>
                {l.label}
              </FooterLink>
            ))}
            {showWorkLink && (
              <FooterLink href="/#work">Case studies</FooterLink>
            )}
          </FooterCol>

          {showServices && (
            <FooterCol title="Services">
              {services
                .filter((s) => s.title)
                .slice(0, 6)
                .map((s) => (
                  <FooterLink key={s.id} href="/#services">
                    {s.title}
                  </FooterLink>
                ))}
            </FooterCol>
          )}

          {(contact.email || contact.whatsapp || contact.calendly) && (
            <FooterCol title="Get in touch">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  <Mail className="h-4 w-4" /> {contact.email}
                </a>
              )}
              {contact.whatsapp && (
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
              {contact.calendly && (
                <a
                  href={contact.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  Book on Calendly
                </a>
              )}
            </FooterCol>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center text-xs text-ink-3 sm:py-8 md:flex-row md:text-left">
          <p>© {year} Tekoovi. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 md:justify-end">
            <Link href="/privacy" className="transition-colors hover:text-ink-2">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ink-2">
              Terms
            </Link>
            <span className="text-ink-3/70">Crafted with intent.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-ink-2 transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}
