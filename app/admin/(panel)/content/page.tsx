import AdminDashboard from "../../dashboard";

/**
 * The landing-page section editor.
 *
 * This is the original admin screen, unchanged — it still drives every block of
 * the marketing page from the SECTIONS registry. The CMS modules around it are
 * new; this one keeps working exactly as it did.
 */
export const dynamic = "force-dynamic";

export default function LandingContentPage() {
  return <AdminDashboard />;
}
