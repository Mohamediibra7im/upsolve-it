import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * The languages offered, and the compiler each one means at the service that
 * runs the code (https://onlinecompiler.io).
 * ponytail: the ids carry versions, so they change when the service updates a
 * compiler; GET https://api.onlinecompiler.io/api/compilers/ lists the current ones.
 */
export const LANGUAGES = {
  cpp17: 'g++-15',
  cpp20: 'g++-15-cpp20',
  python: 'python-3.14',
  java: 'openjdk-25',
} as const;
export type Language = keyof typeof LANGUAGES;

const BASE = 'https://api.onlinecompiler.io';
/** Per run, compilation included. The no-key endpoint allows no more. */
const TIME_LIMIT_SECONDS = 5;
const MEMORY_LIMIT_MB = 256;
/** What one run may send back to the browser of each stream. */
const MAX_STREAM_CHARS = 20_000;

export type RunResult = {
  /** How the run ended; "error" covers a failed compilation and a non-zero exit alike. */
  status: 'ok' | 'error' | 'time-limit' | 'memory-limit' | 'crashed';
  output: string;
  /** What the program or the compiler wrote to the error stream. */
  error: string;
  exitCode: number | null;
  /** Run time of the program itself, without compilation. */
  timeMs: number | null;
  memoryKb: number | null;
  /** Some output was cut off, here or at the service. */
  truncated: boolean;
};

/** How the service's exit codes read: 124 timed out, 137 killed for memory, 139 segfault. */
function statusOf(exitCode: number | null): RunResult['status'] {
  if (exitCode === 0) return 'ok';
  if (exitCode === 124) return 'time-limit';
  if (exitCode === 137) return 'memory-limit';
  if (exitCode === 139) return 'crashed';
  return 'error';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs users' code. It never runs here: it is sent to a sandbox service that
 * has no network access and its own time and memory limits, and only its
 * output comes back.
 */
@Injectable()
export class RunnerService {
  private readonly logger = new Logger(RunnerService.name);

  constructor(private readonly config: ConfigService) {}

  /** One run per input, in order, so that all of them share one place in the service's queue. */
  async run(language: Language, code: string, inputs: string[]) {
    const results: RunResult[] = [];
    for (const input of inputs)
      results.push(await this.runOnce(LANGUAGES[language], code, input));
    return results;
  }

  private async runOnce(
    compiler: string,
    code: string,
    input: string,
  ): Promise<RunResult> {
    const key = this.config.get<string>('ONLINECOMPILER_API_KEY');
    // Without a key the service's small public allowance does for development.
    // In production that allowance is shared by every user, so a key is required.
    if (!key && this.config.get('NODE_ENV') === 'production')
      throw new ServiceUnavailableException(
        'Running code is not set up on this server yet.',
      );
    const url = `${BASE}${key ? '/api/run-code-sync/' : '/api/guest/run-code/'}`;
    const request = () =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { Authorization: key } : {}),
        },
        body: JSON.stringify({
          compiler,
          code,
          input,
          time_limit: TIME_LIMIT_SECONDS,
          ...(key ? { memory_limit: MEMORY_LIMIT_MB } : {}),
        }),
        signal: AbortSignal.timeout(40_000),
      });

    let res: Response;
    try {
      res = await request();
      // Every run slot busy: the service says when to come back. Once is enough.
      const wait = Number(res.headers.get('Retry-After'));
      if (res.status === 429 && wait > 0 && wait <= 5) {
        await sleep(wait * 1000);
        res = await request();
      }
    } catch {
      throw new ServiceUnavailableException(
        'The code runner did not answer. Try again in a moment.',
      );
    }
    if (res.status === 429)
      throw new ServiceUnavailableException(
        'The code runner is busy. Try again in a moment.',
      );
    if (!res.ok) {
      this.logger.warn(`Code runner answered ${res.status}`);
      throw new ServiceUnavailableException(
        'The code runner could not run this. Try again in a moment.',
      );
    }

    const body = (await res.json()) as Record<string, unknown>;
    const text = (value: unknown) => (typeof value === 'string' ? value : '');
    const number = (value: unknown) =>
      value === null || value === undefined || Number.isNaN(Number(value))
        ? null
        : Number(value);
    const exitCode = number(body.exit_code);
    const seconds = number(body.time);
    const output = text(body.output);
    const error = text(body.error);
    return {
      status: statusOf(exitCode),
      output: output.slice(0, MAX_STREAM_CHARS),
      error: error.slice(0, MAX_STREAM_CHARS),
      exitCode,
      timeMs: seconds === null ? null : Math.round(seconds * 1000),
      memoryKb: number(body.memory),
      truncated:
        body.truncated === true ||
        output.length > MAX_STREAM_CHARS ||
        error.length > MAX_STREAM_CHARS,
    };
  }
}
