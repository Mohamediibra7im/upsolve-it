import { act, renderHook } from "@testing-library/react";
import useHistory from "../useHistory";

const account = { codeforcesHandle: "tourist", rating: 1500 };
const mutate = jest.fn();
let available = true;
jest.mock("@/hooks/auth/useUser", () => ({
  __esModule: true,
  default: () => ({ user: account }),
}));
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: [], mutate }),
}));
jest.mock("@/lib/apiClient", () => ({
  swrFetcher: jest.fn(),
  apiFetcher: async (_url: string, options: RequestInit) => {
    if (!available) throw new Error("Save unavailable");
    const body = JSON.parse(String(options.body));
    if (
      "_id" in body ||
      "serverSessionId" in body ||
      body.problems.some((p: any) => "_id" in p)
    )
      throw new Error("Unsupported metadata");
    return { training: { ...body, _id: "saved-id", performance: 1500 } };
  },
}));

const training = {
  _id: "local-id",
  serverSessionId: "metadata",
  startTime: 1000,
  endTime: 2000,
  performance: 99,
  customRatings: { P1: 800, P2: 900, P3: 1000, P4: 1100 },
  problems: [
    {
      _id: "subdoc",
      contestId: 4,
      index: "A",
      name: "Watermelon",
      rating: 800,
      type: "PROGRAMMING" as const,
      points: 0,
      problemsetName: "Codeforces",
      tags: [],
      url: "https://example.com",
      solvedTime: null,
    },
  ],
};

it("sends supported fields and returns the saved server record", async () => {
  available = true;
  const { result } = renderHook(() => useHistory());
  let saved: any;
  await act(async () => {
    saved = await result.current.addTraining(training);
  });
  expect(saved?._id).toBe("saved-id");
  expect(saved?.performance).toBe(1500);
});

it("propagates a failed save so callers can retain and retry the training", async () => {
  available = false;
  const { result } = renderHook(() => useHistory());
  await expect(result.current.addTraining(training)).rejects.toThrow(
    "Save unavailable",
  );
});
