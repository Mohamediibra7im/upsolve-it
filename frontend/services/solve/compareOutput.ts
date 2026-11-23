/**
 * Whether a program's output answers a sample the way the expected output
 * does. Like the standard checker of the judges, it compares the words and
 * numbers in order and ignores how they are spaced or broken into lines.
 *
 * ponytail: a problem that accepts several different answers has its own
 * checker on the judge; here a correct but different answer reads as a
 * mismatch. The screen says a pass is not the judge's verdict.
 */
export function sameOutput(expected: string, actual: string) {
  const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);
  const want = words(expected);
  const got = words(actual);
  return want.length === got.length && want.every((w, i) => w === got[i]);
}
