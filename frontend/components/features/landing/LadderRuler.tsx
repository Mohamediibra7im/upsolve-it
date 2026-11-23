import { Rank } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { RANKS } from "@/utils/rank";

export const LADDER_MIN = 900;
export const LADDER_MAX = 4050;

/** The ladder's 900–4050 range cut at the Codeforces rank colours. */
export const LADDER_BANDS = RANKS.filter(
  (rank, i) => RANKS.findIndex((r) => r.key === rank.key) === i,
).map((rank, i, firsts) => ({
  key: rank.key,
  name:
    rank.key === "gm"
      ? "Grandmaster and above"
      : RANKS.filter((r) => r.key === rank.key)
          .map((r) => r.name)
          .join(", "),
  from: Math.max(rank.min, LADDER_MIN),
  to: firsts[i + 1]?.min ?? LADDER_MAX,
}));

/** `example` marks one rating on the ruler, labelled as an example. */
export default function LadderRuler({ example }: { example?: number }) {
  return (
    <div>
      <div
        className="u-lad"
        role="img"
        aria-label={`The ladder from ${LADDER_MIN} to ${LADDER_MAX}, cut at the Codeforces ranks: ${LADDER_BANDS.map((b) => `${b.name} from ${b.from}`).join(", ")}.${example ? ` Example rating ${example}.` : ""}`}
      >
        <div className="u-lad__bar">
          {LADDER_BANDS.map((band) => (
            <i
              key={band.key}
              data-rank={band.key}
              style={{ flex: band.to - band.from }}
              // Narrow bands drop their number on phones, where they would collide.
              className={cn(
                band.to - band.from < 300 && "max-sm:[&>span]:hidden",
              )}
            >
              <b>{band.name}</b>
              <span>{band.from}</span>
            </i>
          ))}
        </div>
        {example && (
          <div
            className="u-lad__you"
            style={{
              left: `${((example - LADDER_MIN) / (LADDER_MAX - LADDER_MIN)) * 100}%`,
            }}
          >
            <em>Example · {example}</em>
          </div>
        )}
      </div>
      {/* The ruler hides its rank names below 900px, so name the colours here. */}
      <ul className="t-sm flex flex-wrap gap-x-4 gap-y-1 min-[901px]:hidden">
        {LADDER_BANDS.map((band) => (
          <li key={band.key}>
            <Rank
              rating={band.from}
              name={band.name}
              className="[&>span]:normal-case"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
