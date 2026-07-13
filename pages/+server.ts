import "dotenv/config";
import { Hono } from "hono";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import vike from "@vikejs/hono";
import type { Server } from "vike/types";
import { z } from "zod";
import {
  clearSessionCookie,
  parseSessionCookie,
  sessionCookieOptions,
  signSession,
  verifySession,
  verifyUserPin,
} from "../lib/auth.js";
import { AppError, zmwToNgwee } from "../lib/money.js";
import {
  getDashboardData,
  loginUser,
  mockTopUp,
  registerUser,
  sendToPot,
  spendFromPot,
  withdrawFromWallet,
} from "../lib/wallet.js";

const app = new Hono();

function jsonError(error: unknown, status = 400): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status });
}

function requireUser(c: Context): string | Response {
  const token = getCookie(c, "ndalama_session");
  const user = token ? verifySession(token) : parseSessionCookie(c.req.header("cookie"));
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user.id;
}

const registerSchema = z.object({
  phoneNumber: z.string().min(9).max(20),
  password: z.string().min(8),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

const loginSchema = z.object({
  phoneNumber: z.string().min(9).max(20),
  password: z.string().min(1),
});

const amountSchema = z.object({
  amountZmw: z.union([z.string(), z.number()]),
});

const sendToPotSchema = amountSchema.extend({
  potId: z.string().uuid(),
});

const withdrawSchema = amountSchema.extend({
  pin: z.string().regex(/^\d{4}$/),
});

const spendSchema = sendToPotSchema.extend({
  label: z.string().min(1).max(120),
});

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
});

app.post("/api/auth/register", async (c) => {
  try {
    const body = registerSchema.parse(await c.req.json());
    const user = await registerUser(body);
    const token = signSession(user);
    setCookie(c, sessionCookieOptions(token).name, sessionCookieOptions(token).value, {
      maxAge: sessionCookieOptions(token).maxAge,
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
    });
    return Response.json({ user });
  } catch (error) {
    return jsonError(error);
  }
});

app.post("/api/auth/login", async (c) => {
  try {
    const body = loginSchema.parse(await c.req.json());
    const user = await loginUser(body.phoneNumber, body.password);
    const token = signSession(user);
    setCookie(c, sessionCookieOptions(token).name, sessionCookieOptions(token).value, {
      maxAge: sessionCookieOptions(token).maxAge,
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
    });
    return Response.json({ user });
  } catch (error) {
    return jsonError(error);
  }
});

app.post("/api/auth/logout", (c) => {
  const cleared = clearSessionCookie();
  setCookie(c, cleared.name, cleared.value, {
    maxAge: cleared.maxAge,
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
  });
  return Response.json({ ok: true });
});

app.post("/api/auth/verify-pin", async (c) => {
  try {
    const userId = requireUser(c);
    if (userId instanceof Response) return userId;
    const body = pinSchema.parse(await c.req.json());
    const ok = await verifyUserPin(userId, body.pin);
    if (!ok) {
      return Response.json({ error: "Invalid transaction PIN" }, { status: 401 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
});

app.get("/api/wallet/dashboard", async (c) => {
  try {
    const userId = requireUser(c);
    if (userId instanceof Response) return userId;
    const data = await getDashboardData(userId);
    return Response.json(data);
  } catch (error) {
    return jsonError(error, 500);
  }
});

app.post("/api/wallet/mock-top-up", async (c) => {
  try {
    const userId = requireUser(c);
    if (userId instanceof Response) return userId;
    const body = amountSchema.parse(await c.req.json());
    const amountNgwee = zmwToNgwee(body.amountZmw);
    const data = await mockTopUp(userId, amountNgwee);
    return Response.json(data);
  } catch (error) {
    return jsonError(error);
  }
});

app.post("/api/wallet/send-to-pot", async (c) => {
  try {
    const userId = requireUser(c);
    if (userId instanceof Response) return userId;
    const body = sendToPotSchema.parse(await c.req.json());
    const amountNgwee = zmwToNgwee(body.amountZmw);
    const data = await sendToPot(userId, body.potId, amountNgwee);
    return Response.json(data);
  } catch (error) {
    return jsonError(error);
  }
});

app.post("/api/wallet/withdraw", async (c) => {
  try {
    const userId = requireUser(c);
    if (userId instanceof Response) return userId;
    const body = withdrawSchema.parse(await c.req.json());
    const amountNgwee = zmwToNgwee(body.amountZmw);
    const data = await withdrawFromWallet(userId, amountNgwee, body.pin);
    return Response.json(data);
  } catch (error) {
    return jsonError(error);
  }
});

app.post("/api/wallet/spend-from-pot", async (c) => {
  try {
    const userId = requireUser(c);
    if (userId instanceof Response) return userId;
    const body = spendSchema.parse(await c.req.json());
    const amountNgwee = zmwToNgwee(body.amountZmw);
    const data = await spendFromPot(userId, body.potId, amountNgwee, body.label);
    return Response.json(data);
  } catch (error) {
    return jsonError(error);
  }
});

vike(app);

export default {
  fetch: app.fetch,
} satisfies Server;
