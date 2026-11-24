import { Types } from 'mongoose';

/**
 * Announcements that ship with a release. Each has a fixed id, so a restart
 * never adds one twice and an admin's later edits are kept.
 *
 * To retire one early, unpublish it in the admin area: a deleted one is added
 * again on the next start for as long as its entry is listed here.
 * Last in the list is shown first.
 */
export const SEEDED_ANNOUNCEMENTS = [
  {
    _id: new Types.ObjectId('6743a1000000000000000003'),
    title: 'A sharper upsolve queue',
    message: [
      'Add any problem by its link, keep a note on each one and filter the queue.',
      'A problem you upsolved comes back after 7 and 30 days, to check that it stuck.',
      'Your dashboard has a daily upsolve goal, and the Friends page ranks you and your friends by upsolve streak.',
    ].join('\n'),
    actionLabel: 'Open your queue',
    actionUrl: '/upsolve',
  },
  {
    _id: new Types.ObjectId('6743a1000000000000000002'),
    title: 'AtCoder joins your training',
    message: [
      'Add your AtCoder username in Settings.',
      'Problems you missed in AtCoder contests land in your upsolve queue, and your training sets start mixing AtCoder problems in with Codeforces ones.',
    ].join('\n'),
    actionLabel: 'Add your username',
    actionUrl: '/settings',
  },
  {
    _id: new Types.ObjectId('6743a1000000000000000004'),
    title: 'Four new pages to explore',
    message: [
      'Problems: every Codeforces and AtCoder problem the site trains on, by rating, topic and judge.',
      'Topics: how many problems each topic holds at every rating.',
      'Contests: the upcoming rounds of both judges in one calendar, in your own time zone.',
      'Try it: one real problem in the solve workspace, no account needed. Send it to a friend.',
    ].join('\n'),
    actionLabel: 'See the contests',
    actionUrl: '/contests',
  },
  {
    _id: new Types.ObjectId('6743a1000000000000000001'),
    title: 'Solve without leaving the site',
    message: [
      'Start a training session and open a problem: the statement, a code editor and the sample cases are on one page.',
      'Run your C++, Python or Java against the samples. Submit copies your code and opens the judge’s submit page, where you paste it.',
    ].join('\n'),
    actionLabel: 'Start a session',
    actionUrl: '/training',
  },
].map((announcement) => ({
  ...announcement,
  audience: 'members' as const,
  startsAt: null,
  endsAt: new Date('2026-12-22T00:00:00Z'),
  published: true,
}));
