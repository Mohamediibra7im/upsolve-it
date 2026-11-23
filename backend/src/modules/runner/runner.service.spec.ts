import { ConfigService } from '@nestjs/config';
import { RunnerService } from './runner.service';

const config = (values: Record<string, string>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;
const answer = (
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => headers[name] ?? null },
    json: () => Promise.resolve(body),
  } as unknown as Response);
const ran = (extra: object = {}) => ({
  output: '3\n',
  error: '',
  status: 'success',
  exit_code: 0,
  truncated: false,
  time: '0.0152',
  memory: '6336',
  ...extra,
});

describe('RunnerService', () => {
  let fetchMock: jest.SpyInstance;
  afterEach(() => fetchMock.mockRestore());

  it('sends each input as its own run, with the key and the limits, and reads the result', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => answer(ran()));
    const runner = new RunnerService(config({ ONLINECOMPILER_API_KEY: 'k' }));

    const results = await runner.run('cpp17', 'int main(){}', [
      '1 2\n',
      '5 5\n',
    ]);

    expect(results).toEqual([
      {
        status: 'ok',
        output: '3\n',
        error: '',
        exitCode: 0,
        timeMs: 15,
        memoryKb: 6336,
        truncated: false,
      },
      expect.objectContaining({ status: 'ok' }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe('https://api.onlinecompiler.io/api/run-code-sync/');
    expect((init.headers as Record<string, string>).Authorization).toBe('k');
    expect(JSON.parse(init.body as string)).toEqual({
      compiler: 'g++-15',
      code: 'int main(){}',
      input: '5 5\n',
      time_limit: 5,
      memory_limit: 256,
    });
  });

  it('names how a run ended from its exit code', async () => {
    const runner = new RunnerService(config({ ONLINECOMPILER_API_KEY: 'k' }));
    const ends: [number, string][] = [
      [1, 'error'],
      [124, 'time-limit'],
      [137, 'memory-limit'],
      [139, 'crashed'],
    ];
    for (const [exit_code, status] of ends) {
      fetchMock = jest
        .spyOn(global, 'fetch')
        .mockImplementation(() => answer(ran({ exit_code, error: 'boom' })));
      const [result] = await runner.run('python', 'x', ['']);
      expect([result.status, result.error]).toEqual([status, 'boom']);
      fetchMock.mockRestore();
    }
    fetchMock = jest.spyOn(global, 'fetch');
  });

  it('cuts long output and says so', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => answer(ran({ output: 'x'.repeat(30_000) })));
    const runner = new RunnerService(config({ ONLINECOMPILER_API_KEY: 'k' }));
    const [result] = await runner.run('java', 'x', ['']);
    expect([result.output.length, result.truncated]).toEqual([20_000, true]);
  });

  it('waits once when the runner is busy, then gives a clear message', async () => {
    const replies = [answer({}, 429, { 'Retry-After': '1' }), answer(ran())];
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => replies.shift()!);
    const runner = new RunnerService(config({ ONLINECOMPILER_API_KEY: 'k' }));
    expect((await runner.run('cpp20', 'x', ['']))[0].status).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    fetchMock.mockImplementation(() => answer({}, 429));
    await expect(runner.run('cpp20', 'x', [''])).rejects.toThrow(
      'The code runner is busy',
    );
    fetchMock.mockImplementation(() => Promise.reject(new Error('down')));
    await expect(runner.run('cpp20', 'x', [''])).rejects.toThrow(
      'did not answer',
    );
  });

  it('needs a key in production, and uses the public allowance without one elsewhere', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => answer(ran()));
    await expect(
      new RunnerService(config({ NODE_ENV: 'production' })).run('cpp17', 'x', [
        '',
      ]),
    ).rejects.toThrow('not set up on this server yet');
    expect(fetchMock).not.toHaveBeenCalled();

    await new RunnerService(config({ NODE_ENV: 'development' })).run(
      'cpp17',
      'x',
      [''],
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.onlinecompiler.io/api/guest/run-code/');
    expect(init.headers).not.toHaveProperty('Authorization');
  });
});
