import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import useUser from "@/hooks/auth/useUser";
import { apiFetcher } from "@/lib/apiClient";
import type { User } from "@/types/User";

const replace = jest.fn();
const refresh = jest.fn();
const router = { replace, refresh };

jest.mock("next/navigation", () => ({ useRouter: () => router }));

const user: User = {
  _id: "test-user",
  codeforcesHandle: "test_handle",
  rating: 1500,
  avatar: "https://userpic.codeforces.org/no-avatar.jpg",
  rank: "specialist",
  maxRating: 1500,
  maxRank: "specialist",
  role: "user",
  isVerified: true,
};

function mountUser() {
  const cache = new Map();
  return renderHook(() => useUser(), {
    wrapper: ({ children }) => (
      <SWRConfig value={{ provider: () => cache }}>{children}</SWRConfig>
    ),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(user));
});

test("an expired session clears the user and replaces the route through Next.js", async () => {
  global.fetch = jest.fn(async (url) => {
    if (String(url).endsWith("/auth/logout")) return { ok: true, status: 201 };
    return { ok: false, status: 401 };
  }) as jest.Mock;
  const { result } = mountUser();
  await waitFor(() => expect(result.current.user).toEqual(user));

  await act(async () => {
    await expect(apiFetcher("/api/trainings")).rejects.toThrow("Session expired");
  });

  await waitFor(() => expect(result.current.user).toBeNull());
  expect(replace).toHaveBeenCalledWith("/");
  expect(refresh).toHaveBeenCalledTimes(1);
});

test("a temporary refresh network failure keeps the user on the current page", async () => {
  global.fetch = jest.fn(async (url) => {
    if (String(url).endsWith("/auth/refresh")) throw new TypeError("Network unavailable");
    return { ok: false, status: 401 };
  }) as jest.Mock;
  const { result } = mountUser();
  await waitFor(() => expect(result.current.user).toEqual(user));

  await act(async () => {
    await expect(apiFetcher("/api/trainings")).rejects.toThrow("Session expired");
  });

  expect(result.current.user).toEqual(user);
  expect(replace).not.toHaveBeenCalled();
  expect(refresh).not.toHaveBeenCalled();
});
