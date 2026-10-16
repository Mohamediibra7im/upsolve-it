import { act, renderHook, waitFor } from "@testing-library/react";
import useTraining from "../useTraining";
import { apiClient } from "@/lib/apiClient";

const push = jest.fn();
const account = { codeforcesHandle: "tourist", rating: 1500 };
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/hooks/auth/useUser", () => ({
  __esModule: true,
  default: () => ({ user: account, isLoading: false }),
}));
jest.mock("../useProblems", () => ({
  __esModule: true,
  default: () => ({ isLoading: false }),
}));
jest.mock("@/hooks/data/useHistory", () => ({
  __esModule: true,
  default: () => ({ addTraining: jest.fn() }),
}));
jest.mock("@/hooks/data/useUpsolvedProblems", () => ({
  __esModule: true,
  default: () => ({ addUpsolvedProblems: jest.fn() }),
}));
jest.mock("@/services/codeforces/getTrainingSubmissionStatus", () => ({
  __esModule: true,
  default: async () => ({ success: false, error: "offline" }),
}));
jest.mock("@/lib/apiClient", () => ({ apiClient: { post: jest.fn() } }));
jest.mock("swr", () => ({ mutate: async () => undefined }));

it("retains the local session after a failed completion and allows a successful retry", async () => {
  const training = {
    serverSessionId: "session",
    startTime: Date.now() - 60_000,
    endTime: Date.now() + 600_000,
    customRatings: {},
    performance: 0,
    problems: [],
  };
  const storage = new Map([
    ["training-tracker-training", JSON.stringify(training)],
  ]);
  (localStorage.getItem as jest.Mock).mockImplementation(
    (key) => storage.get(key) ?? null,
  );
  (localStorage.setItem as jest.Mock).mockImplementation((key, value) =>
    storage.set(key, value),
  );
  (localStorage.removeItem as jest.Mock).mockImplementation((key) =>
    storage.delete(key),
  );
  (apiClient.post as jest.Mock)
    .mockRejectedValueOnce(new Error("Network unavailable"))
    .mockResolvedValueOnce({ session: training });
  const { result } = renderHook(() => useTraining());
  await waitFor(() =>
    expect(result.current.training?.serverSessionId).toBe("session"),
  );
  await act(async () => {
    await result.current.finishTraining();
  });
  expect(result.current.training?.serverSessionId).toBe("session");
  expect(storage.has("training-tracker-training")).toBe(true);
  expect((result.current as any).finishError).toMatch(/Network unavailable/);
  expect(push).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.finishTraining();
  });
  expect(result.current.training).toBeNull();
  expect(storage.has("training-tracker-training")).toBe(false);
  expect(push).toHaveBeenCalledWith("/training/session/session/review");
});
