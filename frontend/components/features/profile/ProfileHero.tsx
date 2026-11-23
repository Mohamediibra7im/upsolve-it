import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Github,
  Globe,
  Link2,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Bar, Rank } from "@/components/ui/kit";
import UserAvatar from "@/components/shared/UserAvatar";
import type { ProfileLinks } from "@/types/User";
import { profileLinkList } from "@/utils/profileLinks";
import { RANKS, nextRank, rankName } from "@/utils/rank";

const LINK_ICONS: Partial<Record<keyof ProfileLinks, typeof Link2>> = {
  github: Github,
  linkedin: Linkedin,
  x: Twitter,
  website: Globe,
};

/** The top of a profile, private or public: who this is on the left, where
 *  their Codeforces rating stands on the volt block on the right. */
export default function ProfileHero({
  eyebrow,
  person,
  badges,
  actions,
  note,
}: {
  eyebrow: ReactNode;
  person: {
    codeforcesHandle: string;
    displayName?: string;
    bio?: string;
    links?: Partial<ProfileLinks> | null;
    avatar?: string | null;
    glyphAvatar?: string | null;
    rating?: number;
    maxRating?: number;
    organization?: string | null;
  };
  /** Verified, Admin and the like, after the rank. */
  badges?: ReactNode;
  /** Buttons for the viewer, after the links. */
  actions?: ReactNode;
  /** One quiet line under the links. */
  note?: ReactNode;
}) {
  const handle = person.codeforcesHandle;
  const name = person.displayName?.trim();
  const rating = person.rating && person.rating > 0 ? person.rating : 0;
  const best = person.maxRating && person.maxRating > 0 ? person.maxRating : 0;
  const next = rating ? nextRank(rating) : null;
  const floor = next ? RANKS[RANKS.indexOf(next) - 1].min : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <header className="u-panel grid content-between gap-6 p-6 sm:p-8 lg:col-span-8">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
          <UserAvatar {...person} size={96} />
          <div className="min-w-0 flex-1 basis-56">
            <p className="t-eyebrow">{eyebrow}</p>
            <h1 className="t-d2 mt-2 break-words">{name || handle}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {name && <span className="t-num font-semibold">{handle}</span>}
              <Rank rating={rating} showRating />
              {person.organization && (
                <span className="t-muted">{person.organization}</span>
              )}
              {badges}
            </div>
          </div>
        </div>
        {person.bio && (
          <p className="t-lg max-w-[60ch] whitespace-pre-line break-words">
            {person.bio}
          </p>
        )}
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://codeforces.com/profile/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="u-btn u-btn--sm"
            >
              Codeforces <ArrowUpRight aria-hidden="true" />
            </a>
            {profileLinkList(person.links).map(
              ({ key, label, username, href }) => {
                const Icon = LINK_ICONS[key] ?? Link2;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="u-btn u-btn--sm max-w-full"
                    aria-label={`${label}: ${username}`}
                    title={`${label}: ${username}`}
                  >
                    <Icon aria-hidden="true" />
                    <span className="truncate">
                      {LINK_ICONS[key] ? username : label}
                    </span>
                  </a>
                );
              },
            )}
            {actions}
          </div>
          {note}
        </div>
      </header>

      <section
        className="u-inverse grid content-between gap-8 rounded-lg p-6 sm:p-8 lg:col-span-4"
        aria-label="Codeforces rating"
      >
        <div>
          <p className="t-eyebrow">Codeforces rating</p>
          <p className="t-num-xl mt-3">{rating || "—"}</p>
          <p className="t-h2 mt-2">{rankName(rating)}</p>
        </div>
        <div className="grid gap-3">
          {next ? (
            <>
              <p>
                <b className="t-num">{next.min - rating}</b> points to{" "}
                {next.name}
              </p>
              <Bar
                value={((rating - floor) / (next.min - floor)) * 100}
                label={`Progress to ${next.name}`}
              />
              <p className="t-sm t-num flex justify-between">
                <span>{floor}</span>
                <span>{next.min}</span>
              </p>
            </>
          ) : rating ? (
            <p>The highest rank on Codeforces.</p>
          ) : (
            <p>No rated contest yet.</p>
          )}
          {best > 0 && (
            <p className="t-sm">
              Highest rating <b className="t-num">{best}</b> · {rankName(best)}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
