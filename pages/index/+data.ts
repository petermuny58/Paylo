import type { PageContextServer } from "vike/types";
import { getDashboardData } from "../../lib/wallet.js";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const user = pageContext.user ?? null;

  if (!user) {
    return {
      user: null,
      walletBalance: 0,
      pots: [] as Awaited<ReturnType<typeof getDashboardData>>["pots"],
      recentActivity: [] as Awaited<ReturnType<typeof getDashboardData>>["recentActivity"],
    };
  }

  const dashboard = await getDashboardData(user.id);
  return {
    user,
    ...dashboard,
  };
}
