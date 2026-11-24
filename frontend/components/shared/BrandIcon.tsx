import { cn } from "@/lib/utils";

export type BrandName =
  | "github"
  | "linkedin"
  | "x"
  | "atcoder"
  | "leetcode"
  | "codechef"
  | "codeforces";

/**
 * A site's own mark, drawn in the colour of the text around it. The files in
 * /public/brands come from Simple Icons (CC0); AtCoder's is its own site icon.
 */
export default function BrandIcon({
  name,
  className,
}: {
  name: BrandName;
  className?: string;
}) {
  const mask = `url(/brands/${name}.${name === "atcoder" ? "png" : "svg"}) center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-4 shrink-0 bg-current", className)}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
