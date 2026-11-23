import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ProblemsModule } from '../src/modules/problems/problems.module';
import { ProblemsService } from '../src/modules/problems/problems.service';

jest.setTimeout(120_000);

const page = (title: string) => `<div class="problem-statement">
<div class="header"><div class="title">${title}</div>
<div class="time-limit"><div class="property-title">time limit per test</div>1 second</div>
<div class="memory-limit"><div class="property-title">memory limit per test</div>256 megabytes</div></div>
<div><p>Print the sum.</p></div>
<div class="sample-tests"><div class="sample-test">
<div class="input"><pre>1 2</pre></div><div class="output"><pre>3</pre></div></div></div></div>`;

describe('problem statements', () => {
  let mongo: MongoMemoryReplSet;
  let db: Connection;
  let problems: ProblemsService;
  let fetchMock: jest.SpyInstance;
  let answer: () => Promise<Response>;
  const ok = (body: string) => () =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(body),
    } as Response);

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              JWT_SECRET: 'test-access-secret-at-least-32-characters',
              JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters',
              APP_URL: 'https://app.example',
            }),
          ],
        }),
        MongooseModule.forRoot(mongo.getUri('problems_test')),
        ProblemsModule,
      ],
    }).compile();
    db = module.get(getConnectionToken());
    problems = module.get(ProblemsService);
  });
  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => answer());
  });
  afterEach(() => fetchMock.mockRestore());
  afterAll(async () => {
    await db?.close();
    await mongo?.stop();
  });

  it('reads a statement from its judge once, then serves its own copy', async () => {
    answer = ok(page('A. Sum'));
    const first = await problems.statement('codeforces', '1986', 'a');
    expect(first).toMatchObject({
      judge: 'codeforces',
      contestId: 1986,
      index: 'a',
      title: 'A. Sum',
      timeLimit: '1 second',
      samples: [{ input: '1 2\n', output: '3\n' }],
      sourceUrl: 'https://codeforces.com/problemset/problem/1986/A',
    });
    // it says who is asking, and does not pose as a browser
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://codeforces.com/problemset/problem/1986/A');
    expect(init.headers['User-Agent']).toBe(
      'UpsolveIt/1.0 (problem statement viewer; +https://app.example)',
    );

    answer = () => Promise.reject(new Error('must not be asked again'));
    expect((await problems.statement('codeforces', 1986, 'a')).title).toBe(
      'A. Sum',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('asks the judge once when two readers arrive together', async () => {
    answer = ok(page('B. Together'));
    const [a, b] = await Promise.all([
      problems.statement('codeforces', 1986, 'B'),
      problems.statement('codeforces', 1986, 'B'),
    ]);
    expect([a.title, b.title]).toEqual(['B. Together', 'B. Together']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to an old copy when the judge does not answer, and says so when it has none', async () => {
    answer = ok(page('C. Old'));
    await problems.statement('codeforces', 1986, 'C');
    await db
      .model('ProblemStatement')
      .updateOne({ index: 'C' }, { $set: { fetchedAt: new Date(0) } });
    answer = () => Promise.resolve({ ok: false, status: 403 } as Response);
    expect((await problems.statement('codeforces', 1986, 'C')).title).toBe(
      'C. Old',
    );

    await expect(problems.statement('codeforces', 1986, 'D')).rejects.toThrow(
      'could not be loaded from its judge',
    );
    // a page without a statement, such as a challenge page, is not kept
    answer = ok('<html><body>Just a moment…</body></html>');
    await expect(problems.statement('codeforces', 1986, 'E')).rejects.toThrow(
      'could not be read from its judge',
    );
    expect(
      await db.model('ProblemStatement').countDocuments({ index: 'E' }),
    ).toBe(0);
  });

  it('builds the address itself and refuses anything that is not a problem', async () => {
    answer = ok(page('X'));
    for (const index of ['../../x', 'A/B', 'AAAA'])
      await expect(
        problems.statement('codeforces', 1986, index),
      ).rejects.toThrow('not a Codeforces problem');
    await expect(
      problems.statement('codeforces', 'evil.example/x', 'A'),
    ).rejects.toThrow('not a Codeforces problem');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
