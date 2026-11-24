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
  /** What the account logs in with. Older accounts: their Codeforces handle. */
  username: string;
  /** The account's own address; null on accounts made before sign-up asked for one. */
  email: string | null;
  emailVerified: boolean;
  /** Missing on an account that proved itself with AtCoder alone. */
  codeforcesHandle: string;
  rating: number;
  avatar: string;
  rank: string;
  maxRating: number;
  maxRank: string;
  organization?: string;
  lastSyncTime?: number;
  role: "user" | "admin";
  /** The Codeforces handle was shown to be theirs. */
  isVerified: boolean;
  /** The AtCoder handle in `links.atcoder` was shown to be theirs. */
  atcoderVerified: boolean;
  /** Opt-in: true when /u/{codeforcesHandle} is visible to anyone. */
  publicProfile?: boolean;
  displayName?: string;
  bio?: string;
  links?: Partial<ProfileLinks>;
  /** A glyph-avatar value; empty means the Codeforces photo is used. */
  glyphAvatar?: string;
  createdAt?: string;
}
