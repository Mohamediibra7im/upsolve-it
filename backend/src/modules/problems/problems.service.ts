import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { fetchAtcoderCatalog } from '../../common/utils/atcoder-api';
import { problemKey, type Judge } from '../upsolve/schemas/judge';
import {
  ProblemStatement,
  type ProblemStatementDocument,
} from './problem-statement.schema';
import {
  parseAtcoderStatement,
  parseCodeforcesStatement,
} from './statement-parser';

/** A kept statement is read again from its judge after this long. */
const FRESH_FOR_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class ProblemsService {
  /** Requests for the same problem that arrive together share one fetch. */
  private readonly inFlight = new Map<string, Promise<ProblemStatement>>();

  constructor(
    private readonly config: ConfigService,
    @InjectModel(ProblemStatement.name)
    private readonly statements: Model<ProblemStatementDocument>,
  ) {}

  /**
   * The statement of one problem: from our own copy when there is a recent
   * one, otherwise read from the judge, cleaned and kept. If the judge cannot
   * be reached, an old copy is better than none.
   */
  async statement(judge: Judge, contestId: number | string, index: string) {
    const key = problemKey({ judge, contestId, index });
    const found = await this.statements.findOne(key).lean();
    // a copy from before statements were kept in parts is as good as none
    const kept = found?.sections?.length ? found : null;
    if (kept && Date.now() - kept.fetchedAt.getTime() < FRESH_FOR_MS)
      return kept;

    const id = `${key.judge}:${key.contestId}:${key.index}`;
    let fetching = this.inFlight.get(id);
    if (!fetching) {
      fetching = this.read(key).finally(() => this.inFlight.delete(id));
      this.inFlight.set(id, fetching);
    }
    try {
      return await fetching;
    } catch (err) {
      if (kept) return kept;
      throw err;
    }
  }

  /** The judge's own page for a problem. Built from checked parts only, never from a caller's URL. */
  private async sourceUrl(key: ReturnType<typeof problemKey>) {
    if (key.judge === 'codeforces') {
      if (!Number.isInteger(key.contestId) || !/^[A-Za-z]\d?$/.test(key.index))
        throw new BadRequestException('That is not a Codeforces problem.');
      return `https://codeforces.com/problemset/problem/${key.contestId}/${key.index.toUpperCase()}`;
    }
    const { problems } = await fetchAtcoderCatalog();
    for (const [taskId, task] of problems)
      if (task.contestId === key.contestId && task.index === key.index)
        return `https://atcoder.jp/contests/${task.contestId}/tasks/${taskId}`;
    throw new NotFoundException('That AtCoder problem is not known.');
  }

  private async read(key: ReturnType<typeof problemKey>) {
    const sourceUrl = await this.sourceUrl(key);
    let page: string;
    try {
      // Named for what it is, with the site it belongs to: no browser disguise.
      const site = this.config.get<string>('APP_URL');
      const res = await fetch(sourceUrl, {
        headers: {
          'User-Agent': `UpsolveIt/1.0 (problem statement viewer${site ? `; +${site}` : ''})`,
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`answered ${res.status}`);
      page = await res.text();
    } catch {
      throw new ServiceUnavailableException(
        'The problem could not be loaded from its judge. Open it there instead.',
      );
    }

    const parsed =
      key.judge === 'codeforces'
        ? parseCodeforcesStatement(page)
        : parseAtcoderStatement(page);
    if (!parsed)
      throw new ServiceUnavailableException(
        'The problem could not be read from its judge. Open it there instead.',
      );

    const saved = await this.statements
      .findOneAndUpdate(
        key,
        { $set: { ...parsed, ...key, sourceUrl, fetchedAt: new Date() } },
        { upsert: true, returnDocument: 'after' },
      )
      .lean<ProblemStatement>();
    return saved ?? { ...parsed, ...key, sourceUrl, fetchedAt: new Date() };
  }
}
