import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen bg-bg text-ink">
      {/* ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/10 blur-[130px]" />
        <div className="grid-lines absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_30%,transparent_75%)]" />
      </div>
      {children}
    </div>
  );
}
