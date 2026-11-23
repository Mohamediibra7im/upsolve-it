import { ArrowUpRight, Loader2, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Level } from "@/hooks/training";
import { TrainingProblem } from "@/types/TrainingProblem";
import ProblemRow from "./ProblemRow";

interface ProblemsCardProps {
  problems: TrainingProblem[];
  showRatings: boolean;
  isPoolLoading: boolean;
  /** How many problems the chosen mode gives: the empty set shows that many slots. */
  slots: number;
  /** The chosen level. Leave out for modes that do not use it. */
  level?: Level;
  onGenerateProblems: () => void;
  onStartSession: () => void;
}

/** The open lane's set and foot: the generated problems and the actions on them. */
const ProblemsCard = ({
  problems,
  showRatings,
  isPoolLoading,
  slots,
  level,
  onGenerateProblems,
  onStartSession,
}: ProblemsCardProps) => {
  const ready = problems.length > 0;

  const generate = (
    <Button
      variant={ready ? "outline" : "default"}
      size={ready ? "sm" : "default"}
      onClick={onGenerateProblems}
      disabled={isPoolLoading}
    >
      {isPoolLoading ? (
        <>
          <Loader2
            aria-hidden="true"
            className="animate-spin motion-reduce:animate-none"
          />
          Loading problems…
        </>
      ) : (
        <>
          <Shuffle aria-hidden="true" />
          {ready ? "Generate another set" : "Generate a set"}
        </>
      )}
    </Button>
  );

  return (
    <>
      <div className="flex-1 border-t border-line">
        {ready ? (
          problems.map((problem, index) => (
            <ProblemRow
              key={`${problem.contestId}-${problem.index}-${index}`}
              problem={problem}
              index={index}
              showRatings={showRatings}
            />
          ))
        ) : (
          <div className="grid justify-items-start gap-4 px-4 py-6 sm:px-6">
            <p role={isPoolLoading ? "status" : undefined} className="t-muted">
              {isPoolLoading
                ? "We’re loading the problem library. Your set will be ready to generate shortly."
                : "Generate a set for the session you’ve chosen. It appears here, ready to start."}
            </p>
            {generate}
          </div>
        )}
        {!ready && (
          <div className="border-t border-line" aria-hidden="true">
            {[..."ABCDEFGH"].slice(0, slots).map((slot) => (
              <div key={slot} className="u-prow" data-state="locked">
                <span className="u-prow__slot">{slot}</span>
                <span className="h-2.5 w-2/5 rounded-[2px] bg-surface-sunk" />
                <span className="h-2.5 w-10 rounded-[2px] bg-surface-sunk" />
              </div>
            ))}
          </div>
        )}
      </div>
      {(ready || level) && (
        <div className="grid items-center gap-x-4 gap-y-3 border-t border-line px-4 py-4 sm:grid-cols-[1fr_auto] sm:px-6 lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {level && (
              <span className="t-sm t-muted flex flex-wrap gap-x-4">
                <span>
                  Target performance{" "}
                  <b className="t-num text-ink">{level.Performance}</b>
                </span>
                <span>
                  Level time <b className="t-num text-ink">{level.time} min</b>
                </span>
              </span>
            )}
            {ready && generate}
          </div>
          {ready && (
            <Button size="lg" onClick={onStartSession}>
              Start session
              <ArrowUpRight aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default ProblemsCard;
