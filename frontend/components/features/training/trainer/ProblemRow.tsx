import Link from "next/link";
import { ArrowUpRight, Check, Loader2, Lock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrainingProblem } from "@/types/TrainingProblem";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";

function sessionSlotLabel(zeroBasedIndex: number): string {
  if (zeroBasedIndex >= 0 && zeroBasedIndex < 26) {
    return String.fromCharCode(65 + zeroBasedIndex);
  }
  return String(zeroBasedIndex + 1);
}

interface ProblemRowProps {
  problem: TrainingProblem;
  index: number;
  /** Session start time. Absent while the set is only a preview. */
  startTime?: number;
  /** The session has not started yet: the problem stays closed. */
  locked?: boolean;
  submissionStatus?: SubmissionStatus;
  /** Preview only. During a session the rating shows unless contest mode hides it. */
  showRatings?: boolean;
  hideContestDetails?: boolean;
  onProblemOpen?: (problem: TrainingProblem) => void;
  /** Whether the problem was opened. Leave out when opens are not tracked. */
  opened?: boolean;
  showTags?: boolean;
}

const ProblemRow = ({
  problem,
  index,
  startTime,
  locked,
  submissionStatus,
  showRatings,
  hideContestDetails,
  onProblemOpen,
  opened,
  showTags,
}: ProblemRowProps) => {
  const slot = sessionSlotLabel(index);
  const isTraining = startTime !== undefined;
  const hideDetails = locked || (isTraining && hideContestDetails);
  const hideRating = hideDetails || (!isTraining && !showRatings);
  const atcoder = problem.judge === "atcoder";
  const status = isTraining ? submissionStatus?.status : undefined;
  const solved = isTraining && (status === "AC" || Boolean(problem.solvedTime));

  let verdict = null;
  if (solved) {
    verdict = (
      <Badge variant="solved">
        <Check aria-hidden="true" />
        Accepted
        {problem.solvedTime && startTime
          ? ` · ${Math.floor((problem.solvedTime - startTime) / 60000)} min`
          : ""}
      </Badge>
    );
  } else if (status === "WA") {
    const tries = submissionStatus?.attempts ?? 0;
    verdict = (
      <Badge variant="failed">
        <X aria-hidden="true" />
        Wrong answer
        {tries > 0 ? ` · ${tries} ${tries === 1 ? "try" : "tries"}` : ""}
      </Badge>
    );
  } else if (status === "TESTING") {
    verdict = (
      <Badge variant="pending">
        <Loader2
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
        Judging
      </Badge>
    );
  } else if (!locked && opened !== undefined) {
    verdict = (
      <span className="t-sm t-muted">{opened ? "Opened" : "Not opened"}</span>
    );
  }

  const cells = (
    <>
      <span className="u-prow__slot">{slot}</span>
      <div className="min-w-0">
        <div className="u-prow__name group-hover:underline group-hover:underline-offset-[3px]">
          {hideDetails ? `Problem ${slot}` : problem.name}
        </div>
        <div className="u-prow__meta truncate">
          {locked ? (
            "Available when your session starts"
          ) : hideDetails ? (
            "Details hidden in contest mode"
          ) : hideRating ? (
            "Rating hidden"
          ) : (
            <>
              {atcoder ? "AtCoder" : "Contest"}{" "}
              <span className="t-num">
                {atcoder
                  ? String(problem.contestId).toUpperCase()
                  : problem.contestId}
              </span>
              {showTags &&
                (problem.tags ?? []).slice(0, 2).map((tag) => ` · ${tag}`)}
            </>
          )}
        </div>
      </div>
      {hideRating ? (
        <span
          className="u-prow__rating text-ink-faint"
          aria-label="Rating hidden"
        >
          —
        </span>
      ) : (
        <span
          className="u-prow__rating"
          title={
            atcoder
              ? "Estimated from its AtCoder difficulty, on the Codeforces scale"
              : undefined
          }
        >
          {problem.rating}
          {atcoder && (
            <small className="u-est">
              <span className="sr-only">, </span>est
              <span className="sr-only">imated</span>
            </small>
          )}
        </span>
      )}
      <span className="flex items-center gap-3 text-ink-muted">
        {verdict}
        {locked ? (
          <Lock className="size-4" aria-hidden="true" />
        ) : (
          <>
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">
              Opens on {atcoder ? "AtCoder" : "Codeforces"} in a new tab
            </span>
          </>
        )}
      </span>
    </>
  );

  if (locked) {
    return (
      <div className="u-prow" data-state="locked">
        {cells}
      </div>
    );
  }

  return (
    <Link
      href={problem.url}
      target="_blank"
      rel="noopener noreferrer"
      className="u-prow group"
      data-state={solved ? "solved" : status === "WA" ? "failed" : "open"}
      onClick={() => onProblemOpen?.(problem)}
    >
      {cells}
    </Link>
  );
};

export default ProblemRow;
