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
  const req = pageContext.req;
  const cookieHeader =
    req?.headers?.get?.("cookie") ??
    (typeof pageContext.headers?.cookie === "string" ? pageContext.headers.cookie : undefined);

  const user = parseSessionCookie(cookieHeader);
  if (user) {
    pageContext.user = user;
  }
}
