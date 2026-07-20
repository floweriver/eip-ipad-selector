// v1.0.0 | 2026-07-17 | 後台登入/登出 server actions
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function login(formData: FormData) {
  const input = String(formData.get("password") ?? "");
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    redirect("/admin/login?err=noenv");
  }
  if (input !== password) {
    redirect("/admin/login?err=wrong");
  }

  const cookieStore = await cookies();
  cookieStore.set("eip_admin", await sha256(password + "|eip-admin"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 天
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin/products");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("eip_admin");
  redirect("/admin/login");
}
