import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TrainingProblemDto } from './create-training.dto';

const problem = (extra: object) =>
  validate(
    plainToInstance(TrainingProblemDto, {
      index: 'E',
      name: 'Dice Product 3',
      rating: 1500,
      url: 'https://atcoder.jp/contests/abc300/tasks/abc300_e',
      ...extra,
    }),
  );

describe('TrainingProblemDto', () => {
  it('takes a Codeforces problem without a judge, as before', async () => {
    expect(await problem({ contestId: 1996 })).toHaveLength(0);
  });

  it('takes an AtCoder problem, named by its contest', async () => {
    expect(
      await problem({ judge: 'atcoder', contestId: 'abc300' }),
    ).toHaveLength(0);
  });

  it('refuses an unknown judge and a contest id that is neither form', async () => {
    expect(await problem({ judge: 'spoj', contestId: 1 })).toHaveLength(1);
    expect(await problem({ contestId: 0 })).toHaveLength(1);
    expect(await problem({ contestId: 'not a name!' })).toHaveLength(1);
  });
});
