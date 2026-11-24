import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import type { User } from "@/types/User";
import { DeleteUserDialog } from "../DeleteUserDialog";

const user = {
  _id: "u1",
  username: "mona_adel",
  codeforcesHandle: "Mona_CF",
  rating: 1342,
  role: "user",
} as User;

it("deletes only after the account's name has been typed", () => {
  const onConfirm = jest.fn();
  render(
    <DeleteUserDialog
      user={user}
      isDeleting={false}
      onClose={jest.fn()}
      onConfirm={onConfirm}
    />,
  );
  const button = screen.getByRole("button", { name: /Delete account/ });
  expect(button).toBeDisabled();

  const field = screen.getByLabelText(/to confirm/);
  fireEvent.change(field, { target: { value: "mona" } });
  expect(button).toBeDisabled();
  fireEvent.submit(field.closest("form")!);
  expect(onConfirm).not.toHaveBeenCalled();

  // letter case does not matter, as it does not for handles
  fireEvent.change(field, { target: { value: " mona_cf " } });
  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

it("names an account with no Codeforces handle by its username", () => {
  render(
    <DeleteUserDialog
      user={{ ...user, codeforcesHandle: undefined as unknown as string }}
      isDeleting={false}
      onClose={jest.fn()}
      onConfirm={jest.fn()}
    />,
  );
  expect(screen.getByPlaceholderText("mona_adel")).toBeInTheDocument();
});
