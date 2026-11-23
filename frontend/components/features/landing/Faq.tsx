type Question = { q: string; a: string; landing?: true };

/** Every answer is checked against the code: the import window and gym rule in
 *  backend upsolve/utils/contest-sync.ts, the reminder in reminders.service.ts. */
export const FAQ_GROUPS: { id: string; title: string; items: Question[] }[] = [
  {
    id: "account",
    title: "Your account",
    items: [
      {
        q: "Do you need my Codeforces password?",
        a: "No. You prove a handle is yours by placing a short code in your Codeforces first-name field, then restoring your name. Upsolve It never sees your Codeforces login.",
        landing: true,
      },
      {
        q: "Is it free?",
        a: "Free to use. Built in the open under the HNU - FCSIT ICPC Community by Mohamed Ibrahim.",
        landing: true,
      },
      {
        q: "I forgot my password. How do I get back in?",
        a: "Reset it by proving the handle is yours again: place a new short code in your Codeforces first-name field, then choose a new password. A reset ends every session that was signed in with the old one.",
      },
    ],
  },
  {
    id: "training",
    title: "Training",
    items: [
      {
        q: "Which platforms does it work with?",
        a: "Codeforces today: your handle, your rating, the problems and the verdicts all come from there. More platforms are planned.",
      },
      {
        q: "How is a set chosen?",
        a: "Every set is made of Codeforces problems at ratings picked by the mode. Ladder and Weakness use the level you choose. Speed round, Contest and Endurance work from your own rating.",
      },
      {
        q: "Can I choose the topics?",
        a: "Yes. Pick topics before you start and the set is limited to them. Weakness mode picks them for you, from the topics your past sessions left unsolved or solved slowly.",
      },
      {
        q: "What does Contest mode hide?",
        a: "Problem names, topics and ratings stay hidden while the session runs, so you read each problem the way you would in a round.",
      },
      {
        q: "How long is a session?",
        a: "120 minutes for Ladder, Weakness and Contest, 52 minutes for a Speed round, and 180 to 240 minutes for Endurance, which has six to eight problems instead of four.",
      },
    ],
  },
  {
    id: "upsolve-queue",
    title: "The upsolve queue",
    items: [
      {
        q: "Where does the upsolve queue come from?",
        a: "Unsolved problems from your training sessions, plus problems you attempted and did not solve in Codeforces contests over the last 90 days. Gym contests are left out.",
        landing: true,
      },
      {
        q: "How do I know a problem is done?",
        a: "Sync and Upsolve It checks your Codeforces submissions. A problem is marked solved as soon as an accepted verdict appears.",
        landing: true,
      },
      {
        q: "Can I remove a problem I do not want?",
        a: "Yes. Dismiss it once and a later sync will not bring it back.",
      },
    ],
  },
  {
    id: "email",
    title: "Email",
    items: [
      {
        q: "How often do you email me?",
        a: "Only if you opt in and confirm your address, and at most once a week, while problems are waiting. Your status is refreshed first, so a solved problem is never listed. Every email has a link to stop them.",
        landing: true,
      },
    ],
  },
];

export const LANDING_FAQ = FAQ_GROUPS.flatMap((g) => g.items).filter(
  (item) => item.landing,
);

/** Questions that open in place; the first one starts open. */
export default function Faq({ items }: { items: Question[] }) {
  return (
    <div className="u-faq text-ink">
      {items.map((item, i) => (
        <details key={item.q} open={i === 0}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
