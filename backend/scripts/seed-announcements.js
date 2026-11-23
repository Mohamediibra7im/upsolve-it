/**
 * seed-announcements.js
 * Adds the starter announcements as unpublished drafts, for an admin to
 * schedule and publish from /admin/announcements. Safe to run again: an
 * announcement whose title is already stored is left as it is.
 *
 * Usage:
 *   node scripts/seed-announcements.js          (dev database)
 *   node scripts/seed-announcements.js --prod   (production database)
 */

const assert = require('node:assert');
const path = require('node:path');
const mongoose = require('mongoose');

const ANNOUNCEMENTS = [
  {
    title: 'Upsolve It has a new look',
    message:
      'New name, new design, same goal: make every problem you miss count.\n\nTraining now opens in lanes, one per mode. The upsolve queue is grouped by the round each problem came from, and there are new profile and settings pages.',
    actionLabel: 'See the modes',
    actionUrl: '/modes',
    audience: 'everyone',
  },
  {
    title: 'Your failed contest problems, collected for you',
    message:
      'Upsolve It can now pull the problems you tried and did not solve in Codeforces contests from the last 90 days. Live, virtual and out-of-competition rounds all count.\n\nOpen your queue and sync to bring them in.',
    actionLabel: 'Open my queue',
    actionUrl: '/upsolve',
    audience: 'members',
  },
  {
    title: 'Get one email a week about what is still open',
    message:
      'Turn on weekly reminders and we will email you the problems still waiting in your queue. We check Codeforces first, so you are never reminded about something you already solved.\n\nOne email a week at most, and one click to unsubscribe.',
    actionLabel: 'Turn on reminders',
    actionUrl: '/upsolve',
    audience: 'members',
  },
  {
    title: 'Share your training with a public profile',
    message:
      'You can now publish a profile page with your rating, training stats and a year of activity. It is off until you switch it on, and only verified handles can have one.',
    actionLabel: 'Open settings',
    actionUrl: '/settings',
    audience: 'members',
  },
  {
    title: 'Make your profile yours',
    message:
      'Add a display name, a short bio and your links. Pick a generated avatar or keep your Codeforces photo.',
    actionLabel: 'Edit my profile',
    actionUrl: '/profile',
    audience: 'members',
  },
  {
    title: 'Train alongside your friends',
    message:
      'Add the people you practise with and see how their training is going. A little competition helps on the days you would rather skip.',
    actionLabel: 'Find friends',
    actionUrl: '/friends',
    audience: 'members',
  },
  {
    title: 'Practice with a plan',
    message:
      'Upsolve It builds timed problem sets around your Codeforces rating and keeps every problem you miss until you solve it. It is free. All you need is your handle.',
    actionLabel: 'How it works',
    actionUrl: '/how-it-works',
    audience: 'everyone',
  },
  {
    title: 'Tell us what is missing',
    message:
      'Found a bug, or want a feature or another judge supported? We read every message.',
    actionLabel: 'Contact us',
    actionUrl: '/contact',
    audience: 'everyone',
  },
];

// This writes past the API, so repeat the caps from dto/announcement.dto.ts.
for (const a of ANNOUNCEMENTS) {
  assert(a.title.length <= 80, `title too long: ${a.title}`);
  assert(a.message.length <= 600, `message too long: ${a.title}`);
  assert(a.actionLabel.length <= 30, `label too long: ${a.title}`);
  assert(/^\/[a-z-]+$/.test(a.actionUrl), `bad link: ${a.title}`);
  assert(['everyone', 'members'].includes(a.audience), `audience: ${a.title}`);
}

async function run() {
  process.loadEnvFile(path.join(__dirname, '../.env'));
  const key = process.argv.includes('--prod')
    ? 'MONGODB_URI_PROD'
    : 'MONGODB_URI_DEV';
  const uri = process.env[key];
  if (!uri) throw new Error(`${key} not found in .env`);

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`Database: ${db.databaseName}`);

  // createdBy is required: the drafts belong to the longest-standing admin.
  const admin = await db
    .collection('users')
    .findOne({ role: 'admin' }, { sort: { createdAt: 1 } });
  if (!admin) throw new Error('No admin user to own the announcements.');

  // Oldest first in the list above, so the admin page (newest first) shows
  // them in reverse; a second apart keeps that order stable.
  const base = Date.now();
  let added = 0;
  for (const [i, a] of ANNOUNCEMENTS.entries()) {
    const at = new Date(base + i * 1000);
    const result = await db.collection('announcements').updateOne(
      { title: a.title },
      {
        $setOnInsert: {
          ...a,
          startsAt: null,
          endsAt: null,
          published: false,
          createdBy: admin._id,
          createdAt: at,
          updatedAt: at,
          __v: 0,
        },
      },
      { upsert: true },
    );
    added += result.upsertedCount;
  }
  console.log(
    `Added ${added} draft announcements, ${ANNOUNCEMENTS.length - added} already there. Owner: ${admin.codeforcesHandle}`,
  );
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
