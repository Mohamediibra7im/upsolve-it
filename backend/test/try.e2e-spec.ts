import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { configureHttpApplication } from '../src/common/http/configure-http';
import { ProblemsService } from '../src/modules/problems/problems.service';
import { RunnerModule } from '../src/modules/runner/runner.module';

jest.setTimeout(120_000);

const PAGE = `<div class="problem-statement">
<div class="header"><div class="title">A. Watermelon</div>
<div class="time-limit"><div class="property-title">time limit per test</div>1 second</div>
<div class="memory-limit"><div class="property-title">memory limit per test</div>64 megabytes</div></div>
<div><p>Split it.</p></div>
<div class="sample-tests"><div class="sample-test">
<div class="input"><pre>8</pre></div><div class="output"><pre>YES</pre></div></div></div></div>`;

// The real modules on a real database; only the two calls that leave the
// server are replaced: the judge's page and the code runner.
describe('the workspace for visitors, wired as the server wires it', () => {
  let mongo: MongoMemoryReplSet;
  let app: INestApplication;
  let readMock: jest.SpyInstance;
  let fetchMock: jest.SpyInstance;

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
              ONLINECOMPILER_API_KEY: 'k',
            }),
          ],
        }),
        MongooseModule.forRoot(mongo.getUri('try_test')),
        RunnerModule,
      ],
    }).compile();
    app = module.createNestApplication();
    configureHttpApplication(app, app.get(ConfigService));
    await app.init();
    readMock = jest
      .spyOn(
        app.get(ProblemsService) as unknown as {
          readPage: () => Promise<string>;
        },
        'readPage',
      )
      .mockResolvedValue(PAGE);
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () =>
          Promise.resolve({ output: 'YES\n', error: '', exit_code: 0 }),
      } as unknown as Response),
    );
  });
  afterAll(async () => {
    fetchMock?.mockRestore();
    await app?.close();
    await mongo?.stop();
  });

  it('serves a fixed problem without a session and runs code on the samples it stored', async () => {
    const read = await request(app.getHttpServer())
      .get('/api/run/try/statement')
      .query({ problem: 'watermelon' })
      .expect(200);
    expect(read.body.samples).toEqual([{ input: '8\n', output: 'YES\n' }]);
    expect(readMock).toHaveBeenCalledWith(
      'https://codeforces.com/problemset/problem/4/A',
    );

    const run = await request(app.getHttpServer())
      .post('/api/run/try')
      .send({ problem: 'watermelon', language: 'python', code: 'print(1)' })
      .expect(201);
    expect(run.body.results).toEqual([
      expect.objectContaining({ status: 'ok', output: 'YES\n' }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string).input).toBe('8\n');
    // the judge was asked once: the run read the stored copy
    expect(readMock).toHaveBeenCalledTimes(1);
  });

  it('leaves the general runner and statement routes to signed-in users', async () => {
    await request(app.getHttpServer())
      .post('/api/run')
      .send({ language: 'python', code: 'print(1)', inputs: ['1\n'] })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/problems/statement')
      .query({ contestId: 1986, index: 'A' })
      .expect(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
