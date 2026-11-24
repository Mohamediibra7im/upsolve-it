import { fireEvent, render, screen } from "@testing-library/react";
import AnnouncementPopup from "@/components/shared/AnnouncementPopup";
import type { CurrentAnnouncement } from "@/types/Announcement";

let pathname = "/";
let user: { isVerified: boolean; email?: string | null } | null = null;
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
  return render(<AnnouncementPopup />);
}
const popup = () => screen.queryByRole("dialog");
const title = () => screen.queryByRole("heading")?.textContent;
const button = (name: string) =>
  screen.getByRole("button", { name }) as HTMLButtonElement;
const click = (name: string) => fireEvent.click(button(name));

describe("AnnouncementPopup", () => {
  const stored = new Map<string, string>();

  beforeEach(() => {
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

  it("opens by itself with the newest announcement, whole", () => {
    load();
    expect(title()).toBe("Ladder mode is here");
    expect(popup()?.textContent).toContain("Try it today.");
    expect(popup()?.textContent).toContain("1 of 3");
  });

  it("steps by hand and stops at both ends", () => {
    load();
    expect(button("Previous announcement").disabled).toBe(true);
    click("Next announcement");
    expect(title()).toBe("Train alongside your friends");
    click("Next announcement");
    expect(title()).toBe("One email a week");
    expect(popup()?.textContent).toContain("3 of 3");
    expect(button("Next announcement").disabled).toBe(true);
    click("Previous announcement");
    expect(title()).toBe("Train alongside your friends");
  });

  it("shows a single announcement with nothing to step through", () => {
    current = [ladder];
    load();
    expect(title()).toBe("Ladder mode is here");
    expect(popup()?.textContent).not.toContain("1 of 1");
    expect(
      screen.queryByRole("button", { name: "Next announcement" }),
    ).toBeNull();
  });

  it("once closed stays closed on later loads, unread ones included", () => {
    const first = load();
    click("Got it");
    expect(popup()).toBeNull();
    first.unmount();

    load();
    expect(popup()).toBeNull();
  });

  it("comes back with only what is new or edited", () => {
    const first = load();
    click("Got it");
    first.unmount();

    const edited = { ...friends, updatedAt: "2026-11-24T08:00:00.000Z" };
    const added = { ...ladder, id: "65a000000000000000000004", title: "New" };
    current = [added, ladder, edited, reminders];
    load();
    expect(title()).toBe("New");
    expect(popup()?.textContent).toContain("1 of 2");
    click("Next announcement");
    expect(title()).toBe("Train alongside your friends");
  });

  it("shows nothing when there is nothing to announce", () => {
    current = [];
    load();
    expect(popup()).toBeNull();
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
    expect(popup()).toBeNull();
  });

  it("stays out of the way of the handle-verification gate", () => {
    user = { isVerified: false };
    load("/dashboard");
    expect(popup()).toBeNull();
  });

  it("still opens, and still closes, when storage is blocked", () => {
    const blocked = () => {
      throw new Error("blocked");
    };
    (localStorage.getItem as jest.Mock).mockImplementation(blocked);
    (localStorage.setItem as jest.Mock).mockImplementation(blocked);
    load("/dashboard");
    expect(popup()).not.toBeNull();
    click("Got it");
    expect(popup()).toBeNull();
  });

  it("asks a member with no email to add one, first, with a way there", () => {
    user = { isVerified: true, email: null };
    load("/dashboard");
    expect(title()).toBe("Add your email");
    expect(popup()?.textContent).toContain("1 of 4");
    expect(
      screen.getByRole("link", { name: "Add my email" }).getAttribute("href"),
    ).toBe("/settings#settings-account");
  });

  it("asks it once: closed, it stays closed", () => {
    user = { isVerified: true, email: null };
    current = [];
    const first = load("/dashboard");
    expect(title()).toBe("Add your email");
    // the dialog's own X and the Close button both close it
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    first.unmount();
    load("/dashboard");
    expect(popup()).toBeNull();
  });

  it("does not ask a member who has an email", () => {
    user = { isVerified: true, email: "mona@example.com" };
    current = [ladder];
    load("/dashboard");
    expect(title()).toBe("Ladder mode is here");
    expect(popup()?.textContent).not.toContain("of");
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
    expect(screen.getByRole("button", { name: "Got it" })).toBeTruthy();
  });
});
