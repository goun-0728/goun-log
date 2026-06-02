import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAuthClient } from "@/lib/supabase/client";

const ACCESS_COOKIE = "goun_admin_access_token";
const REFRESH_COOKIE = "goun_admin_refresh_token";

export function getConfiguredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

export async function setAdminSession(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getCurrentAdminEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  const adminEmail = getConfiguredAdminEmail();

  if (!token || !adminEmail) return null;

  try {
    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user?.email) return null;

    const userEmail = data.user.email.trim().toLowerCase();
    return userEmail === adminEmail ? data.user.email : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  if (!getConfiguredAdminEmail()) redirect("/admin/login?error=missing-admin-email");

  const email = await getCurrentAdminEmail();
  if (!email) redirect("/admin/login");
  return email;
}
