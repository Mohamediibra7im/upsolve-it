import { act, renderHook } from "@testing-library/react";
import useUpsolvedProblems from "../useUpsolvedProblems";

const mutate = jest.fn();
const posted: any[] = [];
let queue: any;
jest.mock("@/hooks/auth/useUser", () => ({
  __esModule: true,
  default: () => ({ user: { codeforcesHandle: "tourist" } }),
}));
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: queue, mutate }),
}));
jest.mock("@/lib/apiClient", () => ({
  swrFetcher: jest.fn(),
  apiFetcher: async (_url: string, options: RequestInit) => {
    posted.push(JSON.parse(String(options.body)));
    return {};
  },
}));

const problem = (contestId: number, index: string, extra = {}) => ({
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
