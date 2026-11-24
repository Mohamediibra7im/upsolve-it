import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { User } from "@/types/User";
import AccountEmail from "../AccountEmail";

const post = jest.fn();
jest.mock("@/lib/apiClient", () => ({
  apiClient: { post: (...args: unknown[]) => post(...args) },
}));

let current: Partial<User>;
const setUser = jest.fn((next: User) => {
  current = next;
});
jest.mock("@/hooks/auth", () => ({
  useUser: () => ({ user: current, setUser }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  current = { username: "Petr", email: null, emailVerified: false };
});

it("adds an address, then confirms it with the mailed code", async () => {
  post.mockResolvedValueOnce({
    user: { username: "Petr", email: "petr@example.com", emailVerified: false },
  });
  const { rerender } = render(<AccountEmail />);
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: " petr@example.com " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send me a code" }));
  await waitFor(() =>
    expect(post).toHaveBeenCalledWith("/api/auth/email", {
      email: "petr@example.com",
    }),
  );
  await waitFor(() => expect(setUser).toHaveBeenCalled());

  rerender(<AccountEmail />);
  const code = screen.getByLabelText("Code from the email");
  fireEvent.change(code, { target: { value: "12ab" } });
  expect(code).toHaveValue("12");
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(screen.getByRole("alert")).toHaveTextContent("6 digits");
  expect(post).toHaveBeenCalledTimes(1);

  post.mockResolvedValueOnce({
    user: { username: "Petr", email: "petr@example.com", emailVerified: true },
  });
  fireEvent.change(code, { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() =>
    expect(post).toHaveBeenLastCalledWith("/api/auth/email/confirm", {
      code: "123456",
    }),
  );
  await waitFor(() => expect(setUser).toHaveBeenCalledTimes(2));

  rerender(<AccountEmail />);
  expect(screen.getByText("Confirmed")).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

it("shows what the server said when the address is refused", async () => {
  post.mockRejectedValueOnce(
    new Error("That email already has an account. Log in instead."),
  );
  render(<AccountEmail />);
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "taken@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send me a code" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "already has an account",
  );
  expect(setUser).not.toHaveBeenCalled();
});
