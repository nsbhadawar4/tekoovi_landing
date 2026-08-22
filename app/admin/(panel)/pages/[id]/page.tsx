import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ContentEditor resource="pages" singular="Page" id={id} publicPath="" />;
}
