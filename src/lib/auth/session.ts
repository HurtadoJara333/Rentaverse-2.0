// src/lib/auth/session.ts
import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAdmin: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "fallback_secret_32_chars_minimum!!",
  cookieName: "rentaverse_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAdmin(): Promise<void | never> {
  const session = await getSession();
  if (!session.isAdmin) {
    throw new Error("UNAUTHORIZED");
  }
}
