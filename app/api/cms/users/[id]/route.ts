import mongoose from "mongoose";
import { fail, ok, requireRole, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { hashPassword } from "@/backend/lib/password";
import { UserModel, type Role } from "@/backend/models/user.model";
import { recordActivity } from "@/backend/services/content-entry.service";

type Params = { params: Promise<{ id: string }> };

const ROLES: Role[] = ["admin", "editor"];

function invalidId(id: string): boolean {
  return !mongoose.Types.ObjectId.isValid(id);
}

/* PUT /api/cms/users/:id — name, role, and optionally a new password. */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("User not found.", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    await connectDB();
    const user = await UserModel.findById(id);
    if (!user) return fail("User not found.", 404);

    const errors: Record<string, string> = {};

    const name = String(body.name ?? user.name).trim();
    if (!name) errors.name = "Name is required.";

    const role = String(body.role ?? user.role) as Role;
    if (!ROLES.includes(role)) errors.role = "Role must be admin or editor.";

    const password = String(body.password ?? "");
    if (password && password.length < 8) {
      errors.password = "Use at least 8 characters.";
    }

    // Demoting the last admin would lock everyone out of settings and users.
    if (user.role === "admin" && role !== "admin") {
      const admins = await UserModel.countDocuments({ role: "admin" });
      if (admins <= 1) {
        errors.role = "This is the only admin — promote someone else first.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return fail("Please fix the highlighted fields.", 422, errors);
    }

    user.name = name;
    user.role = role;
    if (password) user.passwordHash = await hashPassword(password);
    await user.save();

    await recordActivity("updated", "user", name, auth.session, id);

    const safe = user.toObject();
    delete (safe as { passwordHash?: string }).passwordHash;

    return ok(safe, "User updated");
  } catch (err) {
    return serverError(`PUT user ${id}`, err);
  }
}

/* DELETE /api/cms/users/:id */
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("User not found.", 404);

  try {
    await connectDB();
    const user = await UserModel.findById(id);
    if (!user) return fail("User not found.", 404);

    if (auth.session.userId === id) {
      return fail("You cannot delete your own account.", 409);
    }

    const admins = await UserModel.countDocuments({ role: "admin" });
    if (user.role === "admin" && admins <= 1) {
      return fail("That is the only admin account — promote someone else first.", 409);
    }

    await user.deleteOne();
    await recordActivity("deleted", "user", user.name, auth.session, id);

    return ok({ id }, "User deleted");
  } catch (err) {
    return serverError(`DELETE user ${id}`, err);
  }
}
