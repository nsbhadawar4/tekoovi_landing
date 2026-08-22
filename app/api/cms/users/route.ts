import {
  created,
  fail,
  ok,
  requireRole,
  serverError,
} from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { hashPassword } from "@/backend/lib/password";
import { UserModel, type Role } from "@/backend/models/user.model";
import { recordActivity } from "@/backend/services/content-entry.service";

const ROLES: Role[] = ["admin", "editor"];

/* GET /api/cms/users — admin only; password hashes are never returned. */
export async function GET() {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const users = await UserModel.find()
      .select("-passwordHash")
      .sort({ createdAt: 1 })
      .lean();

    return ok(users);
  } catch (err) {
    return serverError("GET users", err);
  }
}

/* POST /api/cms/users — add a teammate. */
export async function POST(request: Request) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "editor") as Role;

    const errors: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Enter a valid email.";
    if (!name) errors.name = "Name is required.";
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    if (!ROLES.includes(role)) errors.role = "Role must be admin or editor.";

    if (Object.keys(errors).length > 0) {
      return fail("Please fix the highlighted fields.", 422, errors);
    }

    await connectDB();
    if (await UserModel.exists({ email })) {
      return fail("Please fix the highlighted fields.", 422, {
        email: "That email already has an account.",
      });
    }

    const user = await UserModel.create({
      email,
      name,
      passwordHash: await hashPassword(password),
      role,
    });

    await recordActivity("created", "user", name, auth.session, String(user._id));

    const safe = user.toObject();
    delete (safe as { passwordHash?: string }).passwordHash;

    return created(safe, "User created");
  } catch (err) {
    return serverError("POST users", err);
  }
}
