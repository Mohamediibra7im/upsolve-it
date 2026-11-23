import { act, fireEvent, render, screen } from "@testing-library/react";
import TrainingControls from "../trainer/TrainingControls";
import type { Training } from "@/types/Training";

const training: Training = {
  startTime: Date.now() - 60_000,
  endTime: Date.now() + 3_600_000,
  customRatings: { P1: 800, P2: 800, P3: 800, P4: 800 },
  problems: [],
  performance: 0,
};

const setup = (isPreContestPeriod = false) => {
  const onExtendEndTime = jest.fn();
  render(
    <TrainingControls
      training={training}
      isPreContestPeriod={isPreContestPeriod}
      solvedCount={1}
      totalCount={4}
      isRefreshing={false}
      refreshProblemStatus={jest.fn()}
      onFinishTraining={jest.fn()}
      onStopTraining={jest.fn()}
      onExtendEndTime={onExtendEndTime}
    />,
  );
  return onExtendEndTime;
};

it("offers only cancelling before the session starts", () => {
  setup(true);
  expect(screen.getByRole("button", { name: "Cancel session" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Finish session" })).toBeNull();
});

it("extends the session by the break, then hands the controls back on resume", async () => {
  const onExtendEndTime = setup();
  const trigger = screen.getByRole("button", { name: "Take a break" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  const tenMinutes = await screen.findByRole("menuitem", { name: /10/ });
  await act(async () => {
    fireEvent.click(tenMinutes);
  });

  expect(onExtendEndTime).toHaveBeenCalledWith(10);
  expect(screen.queryByRole("button", { name: "Finish session" })).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Resume session" }));
  expect(screen.getByRole("button", { name: "Finish session" })).toBeTruthy();
});
