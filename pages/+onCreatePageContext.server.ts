import type { PageContextServer } from "vike/types";
import { parseSessionCookie } from "../lib/auth.js";

declare global {
  namespace Vike {
    interface PageContext {
      user?: {
        id: string;
        phoneNumber: string;
      };
    }
    interface Server {
      server: "hono";
    }
  }
}

export async function onCreatePageContext(pageContext: PageContextServer) {
  const headers = pageContext.headers;
  const cookieHeader =
    (typeof headers?.cookie === "string" && headers.cookie) ||
    (typeof headers?.Cookie === "string" && headers.Cookie) ||
    pageContext.req?.headers?.get?.("cookie") ||
    undefined;

  const user = parseSessionCookie(cookieHeader || undefined);
  if (user) {
    pageContext.user = user;
  }
}
