import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { RateLimiterGuard } from '../../common/guards/rate-limiter.guard';
import { configureHttpApplication } from '../../common/http/configure-http';
import { ProblemsService } from '../problems/problems.service';
import { RunnerService } from './runner.service';
import { TRY_RUNS_PER_DAY, TryController } from './try.controller';

// What the server keeps for a problem. Nothing here is read from a judge.
const STORED = {
  title: 'Watermelon',
  timeLimit: '1 second',
  memoryLimit: '64 megabytes',
  sections: [{ kind: 'story', html: '<p>Split it.</p>' }],
  samples: [
    { input: '8\n', output: 'YES\n' },
    { input: '2\n', output: 'NO\n' },
  ],
  sourceUrl: 'https://codeforces.com/problemset/problem/4/A',
};
const STORED_INPUTS = STORED.samples.map((s) => s.input);
const ran = () =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () => Promise.resolve({ output: 'YES\n', error: '', exit_code: 0 }),
  } as unknown as Response);
const body = { problem: 'watermelon', language: 'python', code: 'print(1)' };

describe('the workspace for visitors (/api/run/try)', () => {
  let app: INestApplication;
  let controller: TryController;
  let statement: jest.Mock;
  // the one place the runner touches the network
  let fetchMock: jest.SpyInstance;
  /** The inputs sent to the code runner so far, one per outbound call. */
  const sentInputs = () =>
    fetchMock.mock.calls.map(
      ([, init]) =>
        (JSON.parse((init as RequestInit).body as string) as { input: string })
          .input,
    );
  const post = (data: object) =>
    request(app.getHttpServer() as App)
      .post('/api/run/try')
      .send(data);

  // a new app for each test, so each starts with its limits untouched
  beforeEach(async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(ran);
    statement = jest.fn().mockResolvedValue(STORED);
    const module = await Test.createTestingModule({
      controllers: [TryController],
      providers: [
        RunnerService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ ONLINECOMPILER_API_KEY: 'k' }),
        },
        { provide: ProblemsService, useValue: { statement } },
        { provide: APP_GUARD, useClass: RateLimiterGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    // the validation the real server applies
    configureHttpApplication(app, new ConfigService({ NODE_ENV: 'test' }));
    await app.init();
    controller = app.get(TryController);
  });
  afterEach(async () => {
    jest.useRealTimers();
    fetchMock.mockRestore();
    await app.close();
  });

  it('runs the code on the stored samples of the named problem, without a session', async () => {
    const res = await post(body).expect(201);

    expect(statement).toHaveBeenCalledWith('codeforces', 4, 'A');
    expect(sentInputs()).toEqual(STORED_INPUTS);
    expect(res.body.results).toHaveLength(STORED.samples.length);
  });

  it('refuses a problem that is not on the list, to run and to read', async () => {
    await post({ ...body, problem: 'codeforces:1986:A' }).expect(400);
    await post({ language: 'python', code: 'print(1)' }).expect(400);
    const read = (query: object) =>
      request(app.getHttpServer() as App)
        .get('/api/run/try/statement')
        .query(query);
    await read({ problem: 'anything' }).expect(400);
    await read({ judge: 'codeforces', contestId: 1986, index: 'A' }).expect(
      400,
    );
    expect(statement).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();

    const ok = await read({ problem: 'product' }).expect(200);
    expect(statement).toHaveBeenCalledWith('atcoder', 'abc086', 'A');
    expect(ok.body.samples).toEqual(STORED.samples);
  });

  it('refuses inputs sent by the client, and never runs them', async () => {
    await post({ ...body, inputs: ['mine\n'] }).expect(400);
    await post({ ...body, input: 'mine\n' }).expect(400);
    expect(fetchMock).not.toHaveBeenCalled();

    // even handed past the validation, they are not what runs
    await controller.run({ ...body, inputs: ['mine\n'] } as never);
    expect(sentInputs()).toEqual(STORED_INPUTS);
  });

  it('refuses code over the size limit', async () => {
    await post({ ...body, code: 'x'.repeat(64_001) }).expect(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stops every visitor at the daily cap, says why, and starts again the next day', async () => {
    // straight to the controller: the cap is counted there, past the per-address limit
    for (let i = 0; i < TRY_RUNS_PER_DAY; i++)
      await controller.run(body as never);
    const spent = fetchMock.mock.calls.length;

    const res = await post(body).expect(429);
    expect(res.body.message).toMatch(/free runs for today are used up/);
    expect(fetchMock).toHaveBeenCalledTimes(spent);

    jest.useFakeTimers({ now: Date.now() + 24 * 60 * 60 * 1000 });
    await controller.run(body as never);
    expect(fetchMock).toHaveBeenCalledTimes(spent + STORED.samples.length);
  });

  it('limits one address to ten runs, with a message the page can show', async () => {
    for (let i = 0; i < 10; i++) await post(body).expect(201);

    const res = await post(body).expect(429);
    expect(res.body.message).toMatch(/used the free runs for now/);
    expect(fetchMock).toHaveBeenCalledTimes(10 * STORED.samples.length);
  });
});
