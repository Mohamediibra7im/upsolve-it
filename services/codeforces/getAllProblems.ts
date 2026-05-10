import { CodeforcesProblem } from "@/types/Codeforces";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

/**
 * Blacklisted contest IDs that should never appear in generated problems.
 *
 * Categories:
 *  - Kotlin Heroes contests (Kotlin-only submissions)
 *  - Microsoft Q# contests (Q#-only submissions)
 *  - April Fools Day contests (joke/non-standard problems)
 *  - ICPC-style archive contests with statement-only problems
 */
const BLACKLISTED_CONTEST_IDS = new Set([
  // ── April Fools Day Contests ───────────────────────────────────────
  171, 290, 409, 784, 952,

  // ── Kotlin Heroes Contests (Kotlin-only) ───────────────────────────
  // Kotlin Heroes rounds and their practice/div variants
  1170, 1171, 1211, 1212, 1297, 1298, 1346, 1347, 1488, 1489,
  1505, 1532, 1533, 1570, 1571, 1663, 1812, 1910, 1911, 1952,
  1958, 1959, 2011, 2012,
  // Kotlin Heroes Episode 10 and onward
  2052, 2053, 2107, 2108,

  // ── Microsoft Q# Coding Contests (Q#-only) ────────────────────────
  1001, 1002, 1115, 1116, 1356, 1357,

  // ── ICPC-style archive / statement-only contests ───────────────────
  // These are typically imported ICPC regional problems without
  // online judge support; users cannot submit solutions.
  1145,
]);

/**
 * Valid problem index pattern for standard Codeforces contest problems.
 * Standard problems use a single/double letter optionally followed by a digit
 * (e.g., "A", "B1", "C2", "D", "E1"). Non-standard indices like numeric-only
 * or deeply nested identifiers indicate ICPC or imported problemsets.
 */
const VALID_PROBLEM_INDEX = /^[A-Z]\d?$/;

/**
 * Determines whether a Codeforces problem is valid for training.
 *
 * A problem is excluded if it:
 *  1. Belongs to a blacklisted contest (Kotlin Heroes, Q#, April Fools)
 *  2. Is from a gym contest (contestId >= 100000)
 *  3. Has no rating (unrated problems are often statement-only ICPC imports)
 *  4. Is not of type PROGRAMMING (e.g., QUESTION-type problems)
 *  5. Has a non-standard index (numeric-only indices indicate ICPC problems)
 *  6. Is from a contest older than ID 700 (legacy/unstable problems)
 */
function isValidTrainingProblem(problem: CodeforcesProblem): boolean {
  // Exclude blacklisted contests (Kotlin-only, Q#-only, April Fools, etc.)
  if (BLACKLISTED_CONTEST_IDS.has(problem.contestId)) {
    return false;
  }

  // Exclude gym contests — these are often ICPC regionals with no OJ support
  if (problem.contestId >= 100000) {
    return false;
  }

  // Exclude legacy contests before ID 700
  if (problem.contestId < 700) {
    return false;
  }

  // Exclude unrated problems — they are typically statement-only ICPC imports
  // or newly added problems without judge test data
  if (
    problem.rating === undefined ||
    problem.rating === null ||
    problem.rating <= 0
  ) {
    return false;
  }

  // Exclude non-PROGRAMMING problems (e.g., QUESTION type in interactive rounds)
  if (problem.type && problem.type !== "PROGRAMMING") {
    return false;
  }

  // Exclude problems with non-standard indices (e.g., numeric "1", "01")
  // These are typically ICPC-style imported problems
  if (!VALID_PROBLEM_INDEX.test(problem.index)) {
    return false;
  }

  return true;
}

const getAllProblems = async (): Promise<Response<CodeforcesProblem[]>> => {
  try {
    // Use an AbortController to prevent hanging on slow CF API responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch("https://codeforces.com/api/problemset.problems", {
      signal: controller.signal,
      // Next.js data cache: revalidate every hour to avoid hammering the CF API
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (data.status !== "OK") {
      return ErrorResponse("Failed to fetch problems");
    }

    // Apply comprehensive filtering to ensure only solvable, standard
    // Codeforces problems (supporting C++/Python/Java) are returned
    const problems = data.result.problems.filter(isValidTrainingProblem);

    return SuccessResponse(problems);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

export default getAllProblems;



