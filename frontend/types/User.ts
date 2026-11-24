/** `website` is an https URL; every other value is a username on that platform. */
export interface ProfileLinks {
  github: string;
  linkedin: string;
  x: string;
  website: string;
  atcoder: string;
  leetcode: string;
}

export interface User {
  _id: string;
  codeforcesHandle: string;
  rating: number;
  avatar: string;
  rank: string;
  maxRating: number;
  maxRank: string;
  organization?: string;
  lastSyncTime?: number;
  role: "user" | "admin";
  isVerified: boolean;
  /** Opt-in: true when /u/{codeforcesHandle} is visible to anyone. */
  publicProfile?: boolean;
  displayName?: string;
  bio?: string;
  links?: Partial<ProfileLinks>;
  /** A glyph-avatar value; empty means the Codeforces photo is used. */
  glyphAvatar?: string;
  createdAt?: string;
}
