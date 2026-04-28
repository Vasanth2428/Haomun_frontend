export const PLATFORMS = {
  LEETCODE: 'leetcode',
  CODEFORCES: 'codeforces',
  CODECHEF: 'codechef',
  GFG: 'gfg',
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

export const PLATFORM_LABELS: Record<Platform, string> = {
  [PLATFORMS.LEETCODE]: 'LeetCode',
  [PLATFORMS.CODEFORCES]: 'Codeforces',
  [PLATFORMS.CODECHEF]: 'CodeChef',
  [PLATFORMS.GFG]: 'GeeksForGeeks',
};
