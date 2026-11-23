import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "../page.client";

const toast = jest.fn();
jest.mock("@/components/providers/Toast", () => ({
  useToast: () => ({ toast }),
}));
jest.mock("framer-motion", () => {
  const React = require("react");
  const element = (tag: string) =>
    function MotionElement({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      ...props
    }: any) {
      return React.createElement(tag, props, children);
    };
  return {
    m: { form: element("form"), div: element("div"), span: element("span") },
    AnimatePresence: ({ children }: any) => children,
  };
});

const reply = (status: number, body: object) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: async () => body,
  } as Response);
const code = "0123456789abcdef0123456789abcdef";

beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(() => {
  jest.useRealTimers();
});

it("verifies the profile and resets the password using the strict API payloads", async () => {
  global.fetch = jest.fn(async (url, options) => {
    const body = JSON.parse(String(options?.body));
    if (String(url).endsWith("/auth/initiate-reset"))
      return reply(201, {
        code,
        verificationToken: "proof",
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
      });
    if (
      String(url).endsWith("/auth/verify-reset-profile") &&
      JSON.stringify(body) === JSON.stringify({ verificationToken: "proof" })
    )
      return reply(201, {
        resetToken: "reset",
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
      });
    if (
      String(url).endsWith("/auth/reset-password") &&
      JSON.stringify(body) ===
        JSON.stringify({ resetToken: "reset", newPassword: "ReplacementP@ss2" })
    )
      return reply(201, { message: "Changed" });
    return reply(400, { message: "Unexpected endpoint or extra fields" });
  });
  render(<ResetPasswordPage />);
  fireEvent.change(screen.getByLabelText("Codeforces handle"), {
    target: { value: "tourist" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(await screen.findByText(code)).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Codeforces profile settings/i }),
  ).toHaveAttribute("href", "https://codeforces.com/settings/social");
  fireEvent.click(screen.getByRole("button", { name: /Verify profile/i }));
  fireEvent.change(await screen.findByLabelText("New password"), {
    target: { value: "ReplacementP@ss2" },
  });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: "ReplacementP@ss2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "success" }),
    ),
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("expires according to the server deadline and allows a fresh challenge", async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn(() =>
    reply(201, {
      code,
      verificationToken: "proof",
      expiresAt: new Date(Date.now() + 2000).toISOString(),
    }),
  );
  render(<ResetPasswordPage />);
  fireEvent.change(screen.getByLabelText("Codeforces handle"), {
    target: { value: "tourist" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByText(code);
  const { act } = await import("@testing-library/react");
  act(() => {
    jest.advanceTimersByTime(2500);
  });
  expect(screen.getByLabelText("Codeforces handle")).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(/expired/i);
});
