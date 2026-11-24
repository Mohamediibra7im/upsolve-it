import type { User } from "@/types/User";

/**
 * The sign-up step an account still has to do: 1 account, 2 confirm the
 * email, 3 connect a judge and show the handle is theirs (Codeforces or
 * AtCoder: one is enough), and 0 when nothing is left.
 *
 * Only a new account has to confirm its email before going on. A member who
 * already proved a judge and adds an email later, in Settings, stays in the
 * app while that email waits for its code.
 */
export function signupStep(user: User | null): 0 | 1 | 2 | 3 {
  if (!user) return 1;
  if (user.isVerified || user.atcoderVerified) return 0;
  if (user.email && !user.emailVerified) return 2;
  return 3;
}
