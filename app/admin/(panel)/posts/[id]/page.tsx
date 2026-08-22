import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function PostEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ContentEditor
      resource="posts"
      singular="Post"
      id={id}
      publicPath="/blog"
      withTaxonomy
    />
  );
}
