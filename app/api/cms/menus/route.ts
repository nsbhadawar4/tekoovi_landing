import { fail, ok, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { MenuModel, type MenuLocation } from "@/backend/models/menu.model";
import { recordActivity } from "@/backend/services/content-entry.service";

const LOCATIONS: MenuLocation[] = ["header", "footer", "custom"];

/* GET /api/cms/menus — every menu, items already in display order */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const menus = await MenuModel.find().sort({ location: 1 }).lean();

    return ok(
      menus.map((menu) => ({
        ...menu,
        items: [...(menu.items ?? [])].sort((a, b) => a.order - b.order),
      })),
    );
  } catch (err) {
    return serverError("GET menus", err);
  }
}

/**
 * PUT /api/cms/menus — replace one menu's items.
 *
 * The whole list arrives at once because that is how the editor works: drag to
 * reorder, then save. Order is taken from array position, so the client never
 * has to keep index numbers in sync.
 */
export async function PUT(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const location = String(body.location ?? "") as MenuLocation;
    if (!LOCATIONS.includes(location)) {
      return fail("Please fix the highlighted fields.", 422, {
        location: "Unknown menu location.",
      });
    }

    const incoming = Array.isArray(body.items) ? body.items : [];
    const errors: Record<string, string> = {};

    const items = incoming.map((raw, index) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const label = String(item.label ?? "").trim();
      const url = String(item.url ?? "").trim();

      if (!label) errors[`items.${index}.label`] = "Label is required.";
      if (!url) errors[`items.${index}.url`] = "Link is required.";

      return {
        label,
        url,
        newTab: item.newTab === true,
        active: item.active !== false,
        block: String(item.block ?? "").trim(),
        order: index,
      };
    });

    if (Object.keys(errors).length > 0) {
      return fail("Every item needs a label and a link.", 422, errors);
    }

    await connectDB();

    const menu = await MenuModel.findOneAndUpdate(
      { location },
      { $set: { items, name: String(body.name ?? `${location} menu`) } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await recordActivity("updated", "menu", `${location} menu`, auth.session);

    return ok(menu, "Menu saved");
  } catch (err) {
    return serverError("PUT menus", err);
  }
}
