import { ContentList } from "@/components/admin/content-list";

export const dynamic = "force-dynamic";

export default function PagesPage() {
  return (
    <ContentList
      resource="pages"
      singular="Page"
      plural="Pages"
      description="Standalone pages such as About or Contact."
      publicPath=""
    />
  );
}
