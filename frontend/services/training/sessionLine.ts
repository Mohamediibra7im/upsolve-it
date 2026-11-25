import type { SpeedStatus } from "./speedStatus";

const WORDS = [
  "none",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];
const word = (n: number) => WORDS[n] ?? String(n);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * A finished session in one line, for the top of its review: how many were
 * solved, how many of those ahead of the expected pace, and what is left.
 */
export function sessionLine(
  problems: { solved: boolean; speedStatus: SpeedStatus }[],
): string {
  const total = problems.length;
  if (total === 0) return "";
  const solved = problems.filter((p) => p.solved);
  const left = total - solved.length;
  const rest =
    left === 0
      ? "Nothing left to upsolve."
      : `${capital(word(left))} left to upsolve.`;
  if (solved.length === 0) return `None solved this time. ${rest}`;

  const fast = solved.filter((p) => p.speedStatus === "fast").length;
  const pace =
    fast === 0
      ? ""
      : fast < solved.length
        ? `, ${word(fast)} ahead of pace`
        : fast === 1
          ? ", ahead of pace"
          : fast === 2
            ? ", both ahead of pace"
            : ", all ahead of pace";
  const count =
    left === 0 && total > 1
      ? `All ${word(total)} solved`
      : `${capital(word(solved.length))} solved`;
  return `${count}${pace}. ${rest}`;
}
