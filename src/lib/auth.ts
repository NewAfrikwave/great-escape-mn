import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-key"
);

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: AdminSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const user = await db.adminUser.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return { success: false, error: "Invalid credentials" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid credentials" };
  }

  const session: AdminSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = await createToken(session);
  return { success: true, token };
}

export async function verifyAdminAuth(
  request: Request
): Promise<AdminSession | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/admin-token=([^;]+)/);
  if (!match) return null;

  return verifyToken(match[1]);
}
