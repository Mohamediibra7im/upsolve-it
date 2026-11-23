import { act, fireEvent, render, screen } from "@testing-library/react";
import AnnouncementDialog from "@/components/shared/AnnouncementDialog";
import type { CurrentAnnouncement } from "@/types/Announcement";

let pathname = "/";
let user: { isVerified: boolean } | null = null;
let current: CurrentAnnouncement | null = null;
let requested: string | null = null;

jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
jest.mock("@/hooks/auth", () => ({
  useUser: () => ({ user, isLoading: false }),
}));
jest.mock("swr", () => ({
  __esModule: true,
  default: (key: string | null) => {
    requested = key;
    return { data: { announcement: current } };
  },
}));

const announcement: CurrentAnnouncement = {
  id: "65a000000000000000000001",
  title: "Ladder mode is here",
  message: "Climb one rating step at a time.\nTry it today.",
  actionLabel: null,
  actionUrl: null,
  updatedAt: "2026-11-23T12:00:00.000Z",
};

/** Loads the site at `path` and waits past the opening delay. */
function load(path = "/") {
  pathname = path;
  const view = render(<AnnouncementDialog />);
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  return view;
}
const shown = () => screen.queryByRole("dialog");

describe("AnnouncementDialog", () => {
  const stored = new Map<string, string>();

  beforeEach(() => {
    jest.useFakeTimers();
    stored.clear();
    (localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => stored.get(key) ?? null,
    );
    (localStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => void stored.set(key, value),
    );
    user = null;
    current = announcement;
  });

  afterEach(() => jest.useRealTimers());

  it("opens shortly after load, and once closed stays closed on later loads", () => {
    pathname = "/";
    const first = render(<AnnouncementDialog />);
    expect(shown()).toBeNull();
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(shown()?.textContent).toContain("Ladder mode is here");
    expect(shown()?.textContent).toContain("Try it today.");

    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(shown()).toBeNull();
    first.unmount();

    load();
    expect(shown()).toBeNull();
  });

  it("stays closed after Escape too", () => {
    const first = load();
    fireEvent.keyDown(shown()!, { key: "Escape" });
    expect(shown()).toBeNull();
    first.unmount();

    load();
    expect(shown()).toBeNull();
  });

  it("shows an edited announcement again, and a new one", () => {
    // closed on an earlier load
    stored.set(
      "upsolve-announcements-dismissed",
      JSON.stringify([`${announcement.id}:${announcement.updatedAt}`]),
    );
    load().unmount();
    expect(shown()).toBeNull();

    current = { ...announcement, updatedAt: "2026-11-24T08:00:00.000Z" };
    const edited = load();
    expect(shown()).not.toBeNull();
    edited.unmount();

    current = { ...announcement, id: "65a000000000000000000002" };
    load();
    expect(shown()).not.toBeNull();
  });

  it.each([
    "/login",
    "/signup",
    "/reset-password",
    "/admin/announcements",
    "/training",
    "/training/reviews",
  ])("stays out of the way on %s", (path) => {
    load(path);
    expect(shown()).toBeNull();
  });

  it("stays out of the way of the handle-verification gate", () => {
    user = { isVerified: false };
    load("/dashboard");
    expect(shown()).toBeNull();
  });

  it("still opens when storage is blocked", () => {
    (localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error("blocked");
    });
    load("/dashboard");
    expect(shown()).not.toBeNull();
  });

  it("tells the server when the visitor is signed in", () => {
    load();
    expect(requested).toBe("/api/announcements/current");
    user = { isVerified: true };
    load("/dashboard");
    expect(requested).toBe("/api/announcements/current?member=1");
  });

  it("links the action, opening an outside address in a new tab", () => {
    current = {
      ...announcement,
      actionLabel: "See the contest",
      actionUrl: "https://codeforces.com/contests",
    };
    const outside = load();
    const link = screen.getByRole("link", { name: /See the contest/ });
    expect(link.getAttribute("href")).toBe("https://codeforces.com/contests");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    outside.unmount();

    current = { ...current, actionUrl: "javascript:alert(1)" };
    load();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("button", { name: "Got it" })).toBeTruthy();
  });
});
