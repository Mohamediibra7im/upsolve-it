import { render, screen } from "@testing-library/react";
import AdminLayoutClient from "../layout.client";

const replace = jest.fn();
const useUser = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/admin/dashboard",
}));
jest.mock("@/hooks/auth", () => ({ useUser: () => useUser() }));
jest.mock("@/components/layout/SiteShell", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const show = (state: { user: unknown; isLoading: boolean }) => {
  useUser.mockReturnValue(state);
  render(
    <AdminLayoutClient>
      <p>admin only</p>
    </AdminLayoutClient>,
  );
  return screen.queryByText("admin only");
};

describe("admin access check", () => {
  beforeEach(() => replace.mockClear());

  it("shows nothing and stays put while the user is loading", () => {
    expect(show({ user: null, isLoading: true })).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor home without rendering the page", () => {
    expect(show({ user: null, isLoading: false })).toBeNull();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("sends a regular user home without rendering the page", () => {
    expect(show({ user: { role: "user" }, isLoading: false })).toBeNull();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("does not trust an admin role before loading has finished", () => {
    expect(show({ user: { role: "admin" }, isLoading: true })).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders the page for an admin", () => {
    expect(show({ user: { role: "admin" }, isLoading: false })).not.toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });
});
