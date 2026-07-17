import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import type { Contact, Service, Social } from "@/backend/types";
import { NAV_LINKS } from "@/lib/data";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";

export function Footer({
  contact,
  socials,
  services,
}: {
  contact: Contact;
  socials: Social[];
  services: Service[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-bg-2 pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full bg-brand/10 blur-[130px]"
      />
      <Container className="relative">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-ink-2">
              A premium digital product studio building scalable websites, SaaS,
              AI and mobile products for ambitious founders and teams.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Navigate">
            {NAV_LINKS.map((l) => (
              <FooterLink key={l.href} href={`/${l.href}`}>
                {l.label}
              </FooterLink>
            ))}
            <FooterLink href="/#work">Case studies</FooterLink>
          </FooterCol>

          <FooterCol title="Services">
            {services.slice(0, 6).map((s) => (
              <FooterLink key={s.id} href="/#services">
                {s.title}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Get in touch">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              <Mail className="h-4 w-4" /> {contact.email}
            </a>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={contact.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              Book on Calendly
            </a>
          </FooterCol>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-xs text-ink-3 md:flex-row">
          <p>© {year} Tekoovi. All rights reserved.</p>
          <div className="flex items-center gap-6">
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
