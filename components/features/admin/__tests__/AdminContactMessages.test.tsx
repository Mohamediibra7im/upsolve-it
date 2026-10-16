import React from "react";
import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { SWRConfig } from "swr";
import AdminContactMessages from "../AdminContactMessages";

const savedReply = {
  message: "The tabs now work.\nPlease try again.",
  sentAt: "2026-10-16T18:36:13.000Z",
  from: "support@example.com",
  to: "reader@example.com",
  messageId: "<first-reply@example.com>",
};
const contact = {
  _id: "507f1f77bcf86cd799439011",
  name: "Support reader",
  email: "reader@example.com",
  subject: "Website issue",
  message: "I cannot open the other tabs.",
  category: "technical",
  read: true,
  createdAt: "2026-09-08T03:01:24.196Z",
  updatedAt: "2026-10-16T18:36:13.000Z",
};
const response = (data: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => data }) as Response;

function mountInbox() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
      <AdminContactMessages />
    </SWRConfig>,
  );
}

describe("AdminContactMessages reply history", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("shows saved reply text and send time after opening a message", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ messages: [{ ...contact, replies: [savedReply] }] }),
      );
    const first = mountInbox();
    fireEvent.click(
      await screen.findByRole("button", { name: /Website issue/ }),
    );

    const history = screen.getByRole("region", { name: "Sent replies" });
    expect(within(history).getByText(/The tabs now work/)).toBeVisible();
    expect(history.querySelector("time")).toHaveAttribute(
      "dateTime",
      "2026-10-16T18:36:13.000Z",
    );
    first.unmount();

    mountInbox();
    fireEvent.click(
      await screen.findByRole("button", { name: /Website issue/ }),
    );
    expect(screen.getByText(/The tabs now work/)).toBeVisible();
  });

  it("shows a new sent reply immediately without losing older replies", async () => {
    const reply = {
      ...savedReply,
      message: "Let us know if you need help.",
      messageId: "<second-reply@example.com>",
    };
    global.fetch = jest.fn(async (_url, options) =>
      options?.method === "POST"
        ? response({ success: true, reply })
        : response({ messages: [{ ...contact, replies: [savedReply] }] }),
    );
    mountInbox();
    fireEvent.click(
      await screen.findByRole("button", { name: /Website issue/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your reply" }), {
      target: { value: "Let us know if you need help." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));

    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Your reply" })).toBeNull(),
    );
    const history = screen.getByRole("region", { name: "Sent replies" });
    expect(within(history).getByText(/The tabs now work/)).toBeVisible();
    expect(
      within(history).getByText("Let us know if you need help."),
    ).toBeVisible();
  });

  it("keeps the draft and does not show a failed send as a sent reply", async () => {
    global.fetch = jest.fn(async (_url, options) =>
      options?.method === "POST"
        ? response({ message: "Email service unavailable" }, false, 503)
        : response({ messages: [contact] }),
    );
    mountInbox();
    fireEvent.click(
      await screen.findByRole("button", { name: /Website issue/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your reply" }), {
      target: { value: "Please try again." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reply" }));

    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue(
      "Please try again.",
    );
    expect(
      screen.queryByText("Please try again.", { selector: "p" }),
    ).toBeNull();
  });
});
