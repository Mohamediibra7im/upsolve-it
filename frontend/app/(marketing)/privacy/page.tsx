import type { ReactNode } from "react";
import Link from "next/link";
import DocPage from "@/components/features/landing/DocPage";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/privacy");

const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="grid list-disc gap-2 pl-5 marker:text-ink-faint">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);
const B = ({ children }: { children: ReactNode }) => (
  <b className="font-semibold text-ink">{children}</b>
);
const contact = (
  <Link href="/contact" className="t-link">
    contact page
  </Link>
);

/* Keep this in step with what the code does: the user schema, the cookies set
   in the auth controller, the reminder service and the script tags in
   app/layout.tsx. */
const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "the-short-version",
    title: "The short version",
    body: (
      <>
        <p>
          Upsolve It keeps what it needs to run your training: your account,
          your sessions, your upsolve queue and the profile you choose to write.
          It reads public data from Codeforces by your handle. It never asks for
          your Codeforces password.
        </p>
        <p>
          Nothing here is sold, and nothing is used for advertising. Your
          profile is private until you make it public.
        </p>
      </>
    ),
  },
  {
    id: "what-we-store",
    title: "What we store",
    body: (
      <List
        items={[
          <>
            <B>Your account.</B> Your Codeforces handle and a password you
            choose for this site. The password is stored only as a one-way hash,
            so nobody, including us, can read it.
          </>,
          <>
            <B>Your Codeforces profile.</B> Rating, rank, best rating,
            organization and profile picture, as Codeforces publishes them.
          </>,
          <>
            <B>Your training.</B> Every session you run here: the problems, the
            times, what you solved, your streaks and the statistics built from
            them.
          </>,
          <>
            <B>Your upsolve queue.</B> The problems you missed in sessions and
            in recent contests, whether you have solved them since, and the ones
            you removed so they are not added again.
          </>,
          <>
            <B>What you write about yourself.</B> A display name, a short bio,
            links to your other profiles and the avatar you pick. All of it is
            optional.
          </>,
          <>
            <B>Your friends.</B> The requests you send and receive, and who you
            are friends with.
          </>,
          <>
            <B>An email address,</B> only if you turn on the weekly reminder.
          </>,
          <>
            <B>Your sign-ins.</B> For each browser you sign in from: a hashed
            session token, the IP address and a short description of the
            browser. Each one is removed when it expires, seven days after its
            last use.
          </>,
        ]}
      />
    ),
  },
  {
    id: "codeforces",
    title: "What comes from Codeforces",
    body: (
      <>
        <p>
          We ask the public Codeforces API about your handle: your profile, the
          contests you took part in and your submissions. That is how sessions
          know a problem is solved and how missed contest problems reach your
          queue.
        </p>
        <p>
          To prove a handle is yours, you place a short code in the first-name
          field of your Codeforces profile for a moment. We read that field
          once, then you can change it back. We never see or store your
          Codeforces password.
        </p>
      </>
    ),
  },
  {
    id: "who-can-see-it",
    title: "Who can see it",
    body: (
      <List
        items={[
          <>
            <B>You.</B> Everything above, in your dashboard, statistics and
            settings.
          </>,
          <>
            <B>Your friends.</B> Your handle, rating, avatar and a summary of
            your training.
          </>,
          <>
            <B>Everyone, only if you say so.</B> A public profile is off until
            you switch it on in Settings, and it needs a verified handle. It
            shows your handle, rating, the name, bio and links you wrote, your
            training totals and your activity. Switch it off and the page is
            gone.
          </>,
          <>
            <B>Administrators.</B> The people who run the site can see accounts
            and their statistics to keep the service working, and their own
            actions are recorded in an audit log. They cannot see your password.
          </>,
        ]}
      />
    ),
  },
  {
    id: "email",
    title: "Email",
    body: (
      <p>
        We email you only if you ask for the weekly reminder. You confirm the
        address first, you get at most one message a week listing what is still
        waiting in your queue, and nothing is sent when the queue is clear.
        Every message has a link that turns the reminder off, and you can also
        turn it off from the upsolve page. The address is used for nothing else.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and your browser",
    body: (
      <>
        <p>
          Two cookies keep you signed in: a short one that lasts fifteen minutes
          and a longer one that renews it for seven days. Scripts on the page
          cannot read either of them. There are no advertising or tracking
          cookies.
        </p>
        <p>
          Your browser also keeps a few things on your own device so the site
          feels quick: a copy of your profile, the session you are in the middle
          of, the code you write in the workspace, and small choices such as an
          announcement you closed. Signing out removes the copy of your profile;
          clearing your browser data removes the rest.
        </p>
      </>
    ),
  },
  {
    id: "analytics-and-logs",
    title: "Analytics and logs",
    body: (
      <>
        <p>
          We count visits with Cloudflare Web Analytics. It sets no cookies and
          does not follow you across sites; it tells us which pages are read and
          how fast they load.
        </p>
        <p>
          Our servers keep technical logs of requests (the address asked for,
          the result and the browser description) to find faults and stop abuse.
        </p>
      </>
    ),
  },
  {
    id: "services-we-rely-on",
    title: "Services we rely on",
    body: (
      <>
        <p>These services handle data for us, and only to run the site:</p>
        <List
          items={[
            <>
              <B>Fly.io</B> runs the site and the API. The main region is Paris,
              France.
            </>,
            <>
              <B>MongoDB</B> is the database that holds what is listed above.
            </>,
            <>
              <B>Codeforces</B> answers our questions about your handle, and its
              problem pages are read to show a problem inside a session.
            </>,
            <>
              <B>AtCoder</B> and <B>AtCoder Problems</B> do the same for an
              AtCoder username you saved and for AtCoder problems.
            </>,
            <>
              <B>OnlineCompiler</B> runs your code when you press Run. The code
              and the input it runs on are sent to it, and it keeps them under
              its own privacy policy, so leave passwords and keys out of code
              you run. Nothing is sent until you press Run.
            </>,
            <>
              <B>Cloudflare</B> provides the visit counts.
            </>,
            <>
              <B>Gmail</B> delivers the reminder emails.
            </>,
          ]}
        />
        <p>We do not sell your data or share it with advertisers.</p>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "Your choices",
    body: (
      <>
        <List
          items={[
            "Edit or clear your display name, bio, links and avatar in Settings.",
            "Switch your public profile on or off at any time.",
            "Turn the weekly reminder off, which also removes your email address.",
            "Delete a session from your history, or remove a problem from your queue.",
            "Remove a friend, or decline a request.",
            "Sign out, which ends that browser’s session.",
          ]}
        />
        <p>
          To delete your account and everything stored with it, or to ask what
          we hold about you, write to us through the {contact}. There is no
          delete button in the app yet, so we do it by hand.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        When the site starts storing something new, this page changes with it
        and the date at the top moves. Questions about any of it are welcome on
        the {contact}.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <DocPage
      eyebrow="Privacy policy · Last updated November 2026"
      title="Your privacy matters."
      lead="What Upsolve It stores about you, where it comes from, who can see it, and what you can change or remove."
      sections={SECTIONS}
    />
  );
}
