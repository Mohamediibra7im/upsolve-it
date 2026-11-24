"use client";

import Link from "next/link";
import useSWR from "swr";
import BrandIcon from "@/components/shared/BrandIcon";
import { apiFetcher } from "@/lib/apiClient";

type Upcoming = {
  contests: {
    judge: "codeforces" | "atcoder";
    name: string;
    startsAt: string;
  }[];
};

/** "in 5 hours", "in 3 days": how long until a start time. */
function until(startsAt: string) {
  const hours = Math.max(
    1,
    Math.round((Date.parse(startsAt) - Date.now()) / 3_600_000),
  );
  return hours < 48
    ? `in ${hours} ${hours === 1 ? "hour" : "hours"}`
    : `in ${Math.round(hours / 24)} days`;
}

/** The footer's last block: the next round on either judge, in the visitor's
 *  own time. It is a link to the calendar whether or not the round loaded. */
export default function FooterContest() {
  const { data } = useSWR<Upcoming>("/api/contests/upcoming", apiFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 600_000,
  });
  const next = data?.contests?.[0];
  return (
    <Link href="/contests" className="u-foot__next">
      <h2>Next contest</h2>
      {next ? (
        <>
          <b>
            <BrandIcon name={next.judge} />
            <span className="truncate">{next.name}</span>
          </b>
          <small>
            {new Date(next.startsAt).toLocaleString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · "}
            {until(next.startsAt)}
          </small>
        </>
      ) : (
        <>
          <b>Upcoming rounds</b>
          <small>Codeforces and AtCoder in one calendar.</small>
        </>
      )}
    </Link>
  );
}
