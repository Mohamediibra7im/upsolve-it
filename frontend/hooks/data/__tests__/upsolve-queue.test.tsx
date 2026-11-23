import { act, renderHook } from "@testing-library/react";
import useUpsolvedProblems from "../useUpsolvedProblems";

const mutate = jest.fn();
const mutateGlobal = jest.fn();
const posted: any[] = [];
// "METHOD url" of each request, in step with `posted`
const requests: string[] = [];
let queue: any;
jest.mock("@/hooks/auth/useUser", () => ({
  __esModule: true,
  default: () => ({ user: { codeforcesHandle: "tourist" } }),
}));
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: queue, mutate }),
  mutate: (...args: unknown[]) => mutateGlobal(...args),
}));
jest.mock("@/lib/apiClient", () => ({
  swrFetcher: jest.fn(),
  apiFetcher: async (url: string, options: RequestInit) => {
    requests.push(`${options.method} ${url}`);
    posted.push(JSON.parse(String(options.body)));
    return {};
  },
}));

const problem = (contestId: number | string, index: string, extra = {}) => ({
  contestId,
  index,
  name: "P",
  rating: 1200,
  tags: ["dp"],
  url: "https://example.com",
  solvedTime: null,
  ...extra,
});
const history: any = [
  { problems: [problem(1, "A", { _id: "x", attempts: 2 }), problem(2, "B")] },
  { problems: [problem(1, "A"), problem(3, "C"), problem(4, "D")] },
];

beforeEach(() => {
  posted.length = 0;
  requests.length = 0;
  mutate.mockClear();
});

it("adds nothing from history until the queue has loaded", async () => {
  queue = undefined;
  const { result } = renderHook(() => useUpsolvedProblems());
  await act(() => result.current.syncWithHistory(history));
  expect(posted).toEqual([]);
  expect(mutate).not.toHaveBeenCalled();
});

it("posts each missing problem once, with only the accepted fields, and shows nothing before the server answers", async () => {
  queue = {
    items: [problem(2, "B")],
    dismissed: [{ contestId: 3, index: "C" }],
  };
  const { result } = renderHook(() => useUpsolvedProblems());
  await act(() => result.current.syncWithHistory(history));
  expect(posted).toEqual([[problem(1, "A"), problem(4, "D")]]);
  // one plain revalidation, no optimistic rows
  expect(mutate.mock.calls).toEqual([[]]);
});

it("saves a note with a PUT naming the problem, then updates the list without a refetch", async () => {
  queue = { items: [problem(1, "A"), problem(2, "B")], dismissed: [] };
  const { result } = renderHook(() => useUpsolvedProblems());
  await act(() => result.current.saveNote(problem(1, "A") as any, " greedy "));
  expect(requests).toEqual(["PUT /api/upsolve/note"]);
  expect(posted).toEqual([
    { judge: "codeforces", contestId: 1, index: "A", note: " greedy " },
  ]);
  expect(mutate).toHaveBeenCalledTimes(1);
  const [update, revalidate] = mutate.mock.calls[0];
  expect(revalidate).toBe(false);
  expect(update(queue).items).toEqual([
    problem(1, "A", { note: "greedy" }),
    problem(2, "B"),
  ]);
});

it("adds a pasted link with a POST of the url, then revalidates", async () => {
  queue = { items: [], dismissed: [] };
  const { result } = renderHook(() => useUpsolvedProblems());
  const url = "https://codeforces.com/problemset/problem/1/A";
  await act(async () => void (await result.current.addByUrl(url)));
  expect(requests).toEqual(["POST /api/upsolve/by-url"]);
  expect(posted).toEqual([{ url }]);
  expect(mutate.mock.calls).toEqual([[]]);
});

it("skips a re-solve with a POST naming the problem and its judge", async () => {
  queue = { items: [], dismissed: [] };
  const { result } = renderHook(() => useUpsolvedProblems());
  const atcoder = problem("abc300", "C", { judge: "atcoder" });
  await act(() => result.current.skipResolve(atcoder as any));
  expect(requests).toEqual(["POST /api/upsolve/resolve/skip"]);
  expect(posted).toEqual([
    { judge: "atcoder", contestId: "abc300", index: "C" },
  ]);
  expect(mutate.mock.calls).toEqual([[]]);
});
