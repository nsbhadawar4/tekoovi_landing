import { fail, ok, requireRole, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { SettingModel } from "@/backend/models/setting.model";
import { recordActivity } from "@/backend/services/content-entry.service";

type Params = { params: Promise<{ group: string }> };

/** The groups the admin knows how to edit. */
const GROUPS = ["general", "contact", "seo", "footer"];

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { group } = await params;
  if (!GROUPS.includes(group)) return fail("Unknown settings group.", 404);

  try {
    await connectDB();
    const doc = await SettingModel.findOne({ group }).lean();
    return ok(doc?.data ?? {});
  } catch (err) {
    return serverError(`GET settings ${group}`, err);
  }
}

/**
 * PUT /api/cms/settings/:group
 *
 * Site-wide configuration is an admin job — an editor manages content, not the
 * things every page depends on.
 */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const { group } = await params;
  if (!GROUPS.includes(group)) return fail("Unknown settings group.", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    await connectDB();
    const doc = await SettingModel.findOneAndUpdate(
      { group },
      { $set: { data: body } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await recordActivity("updated", "settings", group, auth.session);

    return ok(doc.data, "Settings saved");
  } catch (err) {
    return serverError(`PUT settings ${group}`, err);
  }
}
