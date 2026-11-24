import { act, fireEvent, render, screen } from "@testing-library/react";
import AnnouncementBar from "@/components/shared/AnnouncementBar";
import type { CurrentAnnouncement } from "@/types/Announcement";

let pathname = "/";
let user: { isVerified: boolean } | null = null;
let current: CurrentAnnouncement[] = [];
let requested: string | null = null;

jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
jest.mock("@/hooks/auth", () => ({
  useUser: () => ({ user, isLoading: false }),
}));
jest.mock("swr", () => ({
  __esModule: true,
  default: (key: string | null) => {
    requested = key;
    return { data: { announcements: current } };
  },
}));

const ladder: CurrentAnnouncement = {
  id: "65a000000000000000000001",
  title: "Ladder mode is here",
  message: "Climb one rating step at a time.\nTry it today.",
  actionLabel: null,
  actionUrl: null,
  updatedAt: "2026-11-23T12:00:00.000Z",
};
const friends: CurrentAnnouncement = {
  ...ladder,
  id: "65a000000000000000000002",
  title: "Train alongside your friends",
  actionLabel: "Find friends",
  actionUrl: "/friends",
};
const reminders: CurrentAnnouncement = {
  ...ladder,
  id: "65a000000000000000000003",
  title: "One email a week",
};

function load(path = "/") {
  pathname = path;
  return render(<AnnouncementBar />);
}
const bar = () => screen.queryByRole("region", { name: "Announcements" });
/** The title on show, without the "Announcement 1 of 3:" a screen reader
 *  hears. Read from the page, not by role: an open dialog hides the bar from
 *  assistive technology. */
const title = () =>
  document
    .querySelector(".u-annbar__title")
    ?.textContent?.replace(/^Announcement \d+ of \d+:\s*/, "");
const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));
const wait = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

describe("AnnouncementBar", () => {
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
    current = [ladder, friends, reminders];
  });

  afterEach(() => jest.useRealTimers());

  it("shows every announcement in turn, and starts again after the last", () => {
    load();
    expect(title()).toBe("Ladder mode is here");
    expect(bar()?.textContent).toContain("1 / 3");

    wait(6000);
    expect(title()).toBe("Train alongside your friends");
    wait(6000);
    expect(title()).toBe("One email a week");
    expect(bar()?.textContent).toContain("3 / 3");
    wait(6000);
    expect(title()).toBe("Ladder mode is here");
  });

  it("steps by hand in both directions, wrapping at the ends", () => {
    load();
    click("Previous announcement");
    expect(title()).toBe("One email a week");
    click("Next announcement");
    expect(title()).toBe("Ladder mode is here");
    click("Next announcement");
    expect(title()).toBe("Train alongside your friends");
    // a full turn from the click, not what was left of the last one
    wait(5900);
    expect(title()).toBe("Train alongside your friends");
    wait(100);
    expect(title()).toBe("One email a week");
  });

  it("waits while the pointer or the keyboard is on it", () => {
    load();
    fireEvent.mouseEnter(bar()!);
    wait(20000);
    expect(title()).toBe("Ladder mode is here");
    fireEvent.mouseLeave(bar()!);
    wait(6000);
    expect(title()).toBe("Train alongside your friends");

    fireEvent.focus(screen.getByRole("button", { name: "Next announcement" }));
    wait(20000);
    expect(title()).toBe("Train alongside your friends");
  });

  it("shows a single announcement with nothing to step through", () => {
    current = [ladder];
    load();
    expect(title()).toBe("Ladder mode is here");
    expect(bar()?.textContent).not.toContain("1 / 1");
    expect(
      screen.queryByRole("button", { name: "Next announcement" }),
    ).toBeNull();
  });

  it("opens the whole announcement from its title, and waits while it is open", () => {
    load();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: /Ladder mode is here/ }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Try it today.");
    wait(20000);
    expect(title()).toBe("Ladder mode is here");

    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    // reading one does not hide the bar
    expect(bar()).not.toBeNull();
  });

  it("once hidden stays hidden on later loads", () => {
    const first = load();
    click("Hide announcements");
    expect(bar()).toBeNull();
    first.unmount();

    load();
    expect(bar()).toBeNull();
  });

  it("comes back with only what is new or edited", () => {
    const first = load();
    click("Hide announcements");
    first.unmount();

    const edited = { ...friends, updatedAt: "2026-11-24T08:00:00.000Z" };
    const added = { ...ladder, id: "65a000000000000000000004", title: "New" };
    current = [added, ladder, edited, reminders];
    load();
    expect(title()).toBe("New");
    expect(bar()?.textContent).toContain("1 / 2");
    click("Next announcement");
    expect(title()).toBe("Train alongside your friends");
  });

  it("shows nothing when there is nothing to announce", () => {
    current = [];
    load();
    expect(bar()).toBeNull();
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
    expect(bar()).toBeNull();
  });

  it("stays out of the way of the handle-verification gate", () => {
    user = { isVerified: false };
    load("/dashboard");
    expect(bar()).toBeNull();
  });

  it("still shows, and still hides, when storage is blocked", () => {
    const blocked = () => {
      throw new Error("blocked");
    };
    (localStorage.getItem as jest.Mock).mockImplementation(blocked);
    (localStorage.setItem as jest.Mock).mockImplementation(blocked);
    load("/dashboard");
    expect(bar()).not.toBeNull();
    click("Hide announcements");
    expect(bar()).toBeNull();
  });

  it("tells the server when the visitor is signed in", () => {
    load();
    expect(requested).toBe("/api/announcements/current");
    user = { isVerified: true };
    load("/dashboard");
    expect(requested).toBe("/api/announcements/current?member=1");
  });

  it("links the action, opening an outside address in a new tab", () => {
    current = [friends];
    const inside = load();
    expect(
      screen.getByRole("link", { name: "Find friends" }).getAttribute("href"),
    ).toBe("/friends");
    inside.unmount();

    current = [
      {
        ...ladder,
        actionLabel: "See the contest",
        actionUrl: "https://codeforces.com/contests",
      },
    ];
    const outside = load();
    const link = screen.getByRole("link", { name: /See the contest/ });
    expect(link.getAttribute("href")).toBe("https://codeforces.com/contests");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    outside.unmount();

    current = [{ ...current[0], actionUrl: "javascript:alert(1)" }];
    load();
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: /Ladder mode is here/ }),
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("button", { name: "Got it" })).toBeTruthy();
  });
});
