import type { User } from "@/types/User";
import { signupStep } from "../signupStep";

const account = (fields: Partial<User>) =>
  ({
    email: null,
    emailVerified: false,
    isVerified: false,
    atcoderVerified: false,
    ...fields,
  }) as User;

it("walks a new account through its steps in order", () => {
  expect(signupStep(null)).toBe(1);
  expect(signupStep(account({ email: "a@b.co" }))).toBe(2);
  expect(signupStep(account({ email: "a@b.co", emailVerified: true }))).toBe(3);
  expect(
    signupStep(
      account({ email: "a@b.co", emailVerified: true, atcoderVerified: true }),
    ),
  ).toBe(0);
});

it("lets an older account in with a proven Codeforces handle and no email", () => {
  expect(signupStep(account({ isVerified: true }))).toBe(0);
  // one that never proved its handle still has that to do
  expect(signupStep(account({ codeforcesHandle: "someone" }))).toBe(3);
});

it("keeps a member in the app while an email added in Settings waits for its code", () => {
  expect(signupStep(account({ isVerified: true, email: "a@b.co" }))).toBe(0);
});
