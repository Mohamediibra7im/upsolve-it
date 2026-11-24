import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReminderSettings, { type ReminderStatus } from "../ReminderSettings";

let status: ReminderStatus;
const mutate = jest.fn();
const apiFetcher = jest.fn();
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: status, mutate }),
}));
jest.mock("@/lib/apiClient", () => ({
  apiFetcher: (...args: unknown[]) => apiFetcher(...args),
  swrFetcher: jest.fn(),
}));
jest.mock("@/components/providers/Toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));
jest.mock("@/hooks/auth", () => ({
  useUser: () => ({ user: { email: "mona@example.com", emailVerified: true } }),
}));

const toggle = () => screen.getByRole("switch", { name: "Weekly reminder" });

beforeEach(() => jest.clearAllMocks());

it("turns on with one press, to the account email, with nothing to type", async () => {
  status = { on: false, email: null, canTurnOn: true };
  apiFetcher.mockResolvedValue({
    on: true,
    email: "mona@example.com",
    canTurnOn: true,
  });
  render(<ReminderSettings />);
  expect(toggle()).toHaveAttribute("aria-checked", "false");
  expect(screen.getByText("mona@example.com")).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

  fireEvent.click(toggle());
  await waitFor(() =>
    expect(apiFetcher).toHaveBeenCalledWith("/api/reminders", {
      method: "PUT",
    }),
  );
});

it("turns off with one press", async () => {
  status = { on: true, email: "mona@example.com", canTurnOn: true };
  apiFetcher.mockResolvedValue({ on: false, email: null, canTurnOn: true });
  render(<ReminderSettings />);
  expect(toggle()).toHaveAttribute("aria-checked", "true");
  fireEvent.click(toggle());
  await waitFor(() =>
    expect(apiFetcher).toHaveBeenCalledWith("/api/reminders", {
      method: "DELETE",
    }),
  );
});

it("asks for an account email first when there is none to send to", () => {
  status = { on: false, email: null, canTurnOn: false };
  render(<ReminderSettings />);
  expect(toggle()).toBeDisabled();
  expect(screen.getByRole("link", { name: "account email" })).toHaveAttribute(
    "href",
    "/settings#settings-account",
  );
});
