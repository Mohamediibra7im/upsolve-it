import type {
  AtcoderCatalog,
  AtcoderSubmission,
} from '../../../common/utils/atcoder-api';
import type { CfSubmission } from './contest-sync';

/** Verdicts that are not an attempt yet: still waiting for, or being, judged. */
const UNJUDGED = /^(WJ|WR|\d+\/\d+)/;

/**
 * AtCoder submissions in the shape the sync planner reads, so one planner
 * serves both judges. A submission counts as contest participation when it
 * was made while the contest it was sent in was running. The problem itself
 * is named by its home contest and letter, so a task failed in a contest and
 * solved later in a re-run of it is one problem. No ratings or tags here.
 */
export function toPlannerSubmissions(
  submissions: AtcoderSubmission[],
  catalog: AtcoderCatalog,
): CfSubmission[] {
  return submissions
    .filter((s) => !UNJUDGED.test(s.result))
    .map((s) => {
      const contest = catalog.contests.get(s.contest_id);
      const task = catalog.problems.get(s.problem_id);
      const during =
        !!contest &&
        s.epoch_second >= contest.start &&
        s.epoch_second <= contest.start + contest.duration;
      return {
        creationTimeSeconds: s.epoch_second,
        verdict: s.result === 'AC' ? 'OK' : s.result,
        problem: {
          contestId: task?.contestId ?? s.contest_id,
          index:
            task?.index ??
            s.problem_id.slice(s.problem_id.lastIndexOf('_') + 1).toUpperCase(),
          name: task?.name ?? s.problem_id,
          url: `https://atcoder.jp/contests/${task?.contestId ?? s.contest_id}/tasks/${s.problem_id}`,
        },
        author: { participantType: during ? 'CONTESTANT' : 'PRACTICE' },
      };
    });
}
