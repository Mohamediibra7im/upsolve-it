import { act, fireEvent, render, screen } from "@testing-library/react";
import TrainingControls from "../trainer/TrainingControls";
import type { Training } from "@/types/Training";

const base = (): Training => ({
  startTime: Date.now() - 60_000,
  endTime: Date.now() + 3_600_000,
  customRatings: { P1: 800, P2: 800, P3: 800, P4: 800 },
  problems: [],
  performance: 0,
});

const setup = (training: Training = base(), isPreContestPeriod = false) => {
  const onStartBreak = jest.fn();
  const onEndBreak = jest.fn();
  const refresh = jest.fn();
  render(
    <TrainingControls
      training={training}
      isPreContestPeriod={isPreContestPeriod}
      solvedCount={1}
      totalCount={4}
      isRefreshing={false}
      refreshProblemStatus={refresh}
      onFinishTraining={jest.fn()}
      onStopTraining={jest.fn()}
      onStartBreak={onStartBreak}
      onEndBreak={onEndBreak}
    />,
  );
  return { onStartBreak, onEndBreak, refresh };
};

it("offers only cancelling before the session starts", () => {
  setup(base(), true);
  expect(screen.getByRole("button", { name: "Cancel session" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Finish session" })).toBeNull();
});

it("asks for the break that was picked", async () => {
  const { onStartBreak } = setup();
  const trigger = screen.getByRole("button", { name: "Take a break" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  const tenMinutes = await screen.findByRole("menuitem", { name: /10/ });
  await act(async () => {
    fireEvent.click(tenMinutes);
  });
  expect(onStartBreak).toHaveBeenCalledWith(10);
});

it("shows a running break from the session itself, with only Resume", () => {
  const { onEndBreak } = setup({
    ...base(),
    breakUntil: Date.now() + 5 * 60_000,
    breakUsedMs: 5 * 60_000,
  });
  expect(screen.queryByRole("button", { name: "Finish session" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Resume session" }));
  expect(onEndBreak).toHaveBeenCalled();
});

it("stops offering breaks longer than the budget has left", async () => {
  setup({ ...base(), breakUsedMs: 10 * 60_000 });
  const trigger = screen.getByRole("button", { name: "Take a break" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  const five = await screen.findByRole("menuitem", { name: /^5/ });
  const ten = screen.getByRole("menuitem", { name: /^10/ });
  expect(five.getAttribute("aria-disabled")).not.toBe("true");
  expect(ten.getAttribute("aria-disabled")).toBe("true");
});

it("gives a shared room no break at all", () => {
  setup({ ...base(), roomCode: "abcd1234" });
  expect(screen.queryByRole("button", { name: "Take a break" })).toBeNull();
});

it("lets the refresh button rest after a press", () => {
  const { refresh } = setup();
  const button = screen.getByRole("button", { name: /Refresh status/ });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect((button as HTMLButtonElement).disabled).toBe(true);
});

it("in a shared room asks for a vote and offers leaving, not discarding", () => {
  const onFinish = jest.fn();
  const onStop = jest.fn();
  const controls = (voteBlocked: string | null) => (
    <TrainingControls
      compact
      training={{ ...base(), roomCode: "abcd1234" }}
      isPreContestPeriod={false}
      solvedCount={1}
      totalCount={4}
      isRefreshing={false}
      refreshProblemStatus={jest.fn()}
      onFinishTraining={onFinish}
      onStopTraining={onStop}
      onStartBreak={jest.fn()}
      onEndBreak={jest.fn()}
      shared={{ voteBlocked }}
    />
  );
  const { rerender } = render(controls(null));
  expect(screen.queryByRole("button", { name: "Finish" })).toBeNull();
  expect(screen.queryByRole("button", { name: /Discard/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Vote to end" }));
  fireEvent.click(screen.getByRole("button", { name: "Leave the room" }));
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(onStop).toHaveBeenCalledTimes(1);

  // while a vote runs, or the caller still waits, no second vote
  rerender(controls("A vote is already running."));
  const blocked = screen.getByRole("button", { name: "Vote to end" });
  expect(blocked).toHaveProperty("disabled", true);
  expect(blocked.getAttribute("title")).toBe("A vote is already running.");
});
