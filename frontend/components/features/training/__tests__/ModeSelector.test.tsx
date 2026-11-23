import { fireEvent, render, screen } from "@testing-library/react";
import ModeSelector from "../ModeSelector";

it("opens the chosen lane in place and moves focus to it", () => {
  const onChange = jest.fn();
  const lanes = (value: "ladder" | "contest") => (
    <ModeSelector value={value} onChange={onChange} ready={false}>
      setup
    </ModeSelector>
  );
  const { rerender } = render(lanes("ladder"));

  expect(screen.getByRole("group", { name: "Training mode" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Ladder" })).toBeTruthy();
  expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(4);

  fireEvent.click(screen.getByRole("button", { name: /Contest/ }));
  expect(onChange).toHaveBeenCalledWith("contest");

  rerender(lanes("contest"));
  expect(screen.queryByRole("button", { name: /Contest/ })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Contest" }),
  );
});
