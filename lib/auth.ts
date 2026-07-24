import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;
const SESSION_COOKIE = "paylo_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  phoneNumber: string;
};

export type SessionPayload = SessionUser & {
  iat?: number;
  exp?: number;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export async function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export async function verifySecret(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

export function signSession(user: SessionUser): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn: SESSION_MAX_AGE_SEC });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;
    return { id: decoded.id, phoneNumber: decoded.phoneNumber };
  } catch {
    return null;
  }
}

export function parseSessionCookie(cookieHeader: string | null | undefined): SessionUser | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySession(decodeURIComponent(match[1]));
}

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export function sessionCookieOptions(token: string): {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  secure: boolean;
} {
  return {
    name: SESSION_COOKIE,
    value: token,
    maxAge: SESSION_MAX_AGE_SEC,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: cookieSecure(),
  };
}

export function clearSessionCookie(): {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  secure: boolean;
} {
  return {
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: cookieSecure(),
  };
}

export async function verifyUserPin(userId: string, pin: string): Promise<boolean> {
  const { getPrisma } = await import("./prisma.js");
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true },
  });
  if (!user) return false;
  return verifySecret(pin, user.pinHash);
}
