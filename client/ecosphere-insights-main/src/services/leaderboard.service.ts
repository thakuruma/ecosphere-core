import { api, withFallback } from "./api";
import { mock } from "./mock-db";
import type { Badge, LeaderboardEntry } from "@/types/api";

export const leaderboardService = {
  list: () =>
    withFallback(
      async () => (await api.get<LeaderboardEntry[]>("/leaderboard")).data,
      () =>
        [...mock.employees]
          .sort((a, b) => b.xp_points - a.xp_points)
          .map((e) => ({
            id: e.id,
            name: e.name,
            xp_points: e.xp_points,
            badge_count: mock.badges.filter((b) => b.unlock_xp_threshold <= e.xp_points).length,
          })),
    ),
  badges: () =>
    withFallback(
      async () => (await api.get<Badge[]>("/badges")).data,
      () => [...mock.badges],
    ),
};