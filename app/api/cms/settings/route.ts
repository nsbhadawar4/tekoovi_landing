import { ok, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { SettingModel } from "@/backend/models/setting.model";

/* GET /api/cms/settings — every group, keyed by name */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const groups = await SettingModel.find().lean();

    return ok(
      Object.fromEntries(groups.map((group) => [group.group, group.data ?? {}])),
    );
  } catch (err) {
    return serverError("GET settings", err);
  }
}
