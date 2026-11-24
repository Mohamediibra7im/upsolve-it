import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readPage } from '../../common/utils/read-page';
import {
  JUDGES,
  type Judge,
  type UpcomingContest,
  mergeUpcoming,
  parseAtcoderContests,
  parseCodeforcesContests,
} from './upcoming-contests';

const MINUTE = 60 * 1000;
/** How long a judge's schedule is kept before it is asked for again. */
const TTL_MS: Record<Judge, number> = {
  codeforces: 30 * MINUTE,
  atcoder: 60 * MINUTE,
};
/** After a failed read, the judge is left alone for this long. */
const RETRY_MS = 5 * MINUTE;

type Slot = {
  /** when the judge may be asked again */
  nextAt: number;
  /** the last schedule that was read; null until one is */
  value: UpcomingContest[] | null;
  pending?: Promise<void>;
};

/**
 * Upcoming rounds on Codeforces and AtCoder.
 * ponytail: one copy per judge in memory per machine, like the problem
 * catalogs. A restart starts empty and asks both judges once.
 */
@Injectable()
export class ContestsService {
  private readonly slots: Record<Judge, Slot> = {
    codeforces: { nextAt: 0, value: null },
    atcoder: { nextAt: 0, value: null },
  };

  constructor(private readonly config: ConfigService) {}

  private async load(judge: Judge): Promise<UpcomingContest[]> {
    if (judge === 'codeforces') {
      const res = await fetch('https://codeforces.com/api/contest.list', {
        signal: AbortSignal.timeout(15000),
      });
      return parseCodeforcesContests(await res.json());
    }
    // AtCoder has no API and AtCoder Problems lists a round only once it has
    // started, so the schedule is read from AtCoder's own contests page,
    // under the site's own name. If AtCoder refuses, it is reported as
    // unavailable: there is no disguise to fall back on.
    const site = this.config.get<string>('APP_URL');
    return parseAtcoderContests(
      await readPage(
        'https://atcoder.jp/contests/?lang=en',
        `UpsolveIt/1.0 (contest calendar${site ? `; +${site}` : ''})`,
      ),
    );
  }

  /** A judge's schedule: fresh, or the last good copy, or null when there is none. */
  private async read(judge: Judge, nowMs: number) {
    const slot = this.slots[judge];
    if (nowMs >= slot.nextAt)
      slot.pending ??= this.load(judge)
        .then(
          (value) => {
            slot.value = value;
            slot.nextAt = nowMs + TTL_MS[judge];
          },
          () => {
            slot.nextAt = nowMs + RETRY_MS;
          },
        )
        .finally(() => {
          slot.pending = undefined;
        });
    await slot.pending;
    return slot.value;
  }

  async upcoming(nowMs: number = Date.now()) {
    const lists = await Promise.all(JUDGES.map((j) => this.read(j, nowMs)));
    return {
      contests: mergeUpcoming(
        lists.map((list) => list ?? []),
        nowMs,
      ),
      unavailable: JUDGES.filter((_, i) => lists[i] === null),
    };
  }
}
