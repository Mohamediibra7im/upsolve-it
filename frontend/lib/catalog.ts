import type { Judge } from "@/types/TrainingProblem";
import { serverApiFetch } from "./serverApi";

/** The public problem catalogue: /problems and /topics read it on the server. */

export type CatalogProblem = {
  judge: Judge;
  contestId: number | string;
  index: string;
  name: string;
  /** On the Codeforces scale; an estimate for AtCoder. Null when unrated. */
  rating: number | null;
  tags: string[];
  url: string;
};
export type RatingBand = { min: number; max: number };
export type CatalogPage = {
  problems: CatalogProblem[];
  total: number;
  page: number;
  pageSize: number;
  /** What the query keeps before its rating range, counted per band. */
  bands: (RatingBand & { count: number })[];
};
export type Topic = {
  tag: string;
  total: number;
  /** One count per band; unrated problems are in `total` only. */
  counts: number[];
};
export type TopicList = {
  bands: RatingBand[];
  problems: Record<Judge, number>;
  topics: Topic[];
};

/** How the catalogue is narrowed. Empty values mean "no limit". */
export type CatalogQuery = {
  judge: Judge | "";
  min: number | null;
  max: number | null;
  tag: string;
  q: string;
  page: number;
};

export const NO_QUERY: CatalogQuery = {
  judge: "",
  min: null,
  max: null,
  tag: "",
  q: "",
  page: 1,
};

export const JUDGE_NAME: Record<Judge, string> = {
  codeforces: "Codeforces",
  atcoder: "AtCoder",
};

type Params = Record<string, string | string[] | undefined>;

const whole = (value: string, least: number, most: number) => {
  const n = Number(value);
  return value && Number.isInteger(n) && n >= least && n <= most ? n : null;
};

/**
 * Reads the filters from a page address or a submitted form. Anything the
 * API would refuse is dropped here, so a hand-typed address still loads.
 */
export function parseCatalogQuery(params: Params): CatalogQuery {
  const text = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value.trim() : "";
  };
  const judge = text("judge");
  return {
    judge: judge === "codeforces" || judge === "atcoder" ? judge : "",
    min: whole(text("min"), 0, 5000),
    max: whole(text("max"), 0, 5000),
    tag: text("tag").slice(0, 60),
    q: text("q").slice(0, 80),
    page: whole(text("page"), 1, 100000) ?? 1,
  };
}

/** The filters as a query string, without anything left at its default. */
export function catalogSearch(query: CatalogQuery) {
  const q = new URLSearchParams();
  if (query.judge) q.set("judge", query.judge);
  if (query.min !== null) q.set("min", String(query.min));
  if (query.max !== null) q.set("max", String(query.max));
  if (query.tag) q.set("tag", query.tag);
  if (query.q) q.set("q", query.q);
  if (query.page > 1) q.set("page", String(query.page));
  const text = q.toString();
  return text ? `?${text}` : "";
}

/** The /problems address for a set of filters. */
export const catalogHref = (query: CatalogQuery) =>
  `/problems${catalogSearch(query)}`;

/** Null when the API cannot answer: the page shows that instead of failing. */
async function read<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await serverApiFetch(path, revalidate);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export const fetchCatalog = (query: CatalogQuery) =>
  read<CatalogPage>(`/api/problems/catalog${catalogSearch(query)}`, 300);

export const fetchTopics = () => read<TopicList>("/api/problems/topics", 3600);
