import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Workspace from "../Workspace";

const STATEMENT = {
  title: "Watermelon",
  timeLimit: "1 second",
  memoryLimit: "64 megabytes",
  sections: [{ kind: "story", html: "<p>Split it.</p>" }],
  samples: [{ input: "8\n", output: "YES\n" }],
  sourceUrl: "https://codeforces.com/problemset/problem/4/A",
};
const read = jest.fn();
const apiFetcher = jest.fn();
jest.mock("swr", () => ({
  __esModule: true,
  default: (key: string) => {
    read(key);
    return { data: STATEMENT, isLoading: false, mutate: jest.fn() };
  },
}));
jest.mock("@/lib/apiClient", () => ({
  swrFetcher: jest.fn(),
  apiFetcher: (...args: unknown[]) => apiFetcher(...args),
}));
// the editor needs a real browser; what it holds is the draft either way
jest.mock("../CodeEditor", () => ({ __esModule: true, default: () => null }));

const problem = {
  contestId: 4,
  index: "A",
  name: "Watermelon",
  rating: 800,
  tags: [],
  url: "https://codeforces.com/problemset/problem/4/A",
  problemsetName: "",
  type: "PROGRAMMING",
  points: 0,
  solvedTime: null,
};
const show = (tryKeys?: string[]) =>
  render(
    <Workspace
      title="Set"
      problems={[problem]}
      statuses={[]}
      hideDetails={false}
      onProblemOpen={() => {}}
      tryKeys={tryKeys}
    />,
  );
const runAndReadRequest = async () => {
  apiFetcher.mockResolvedValue({
    results: [
      {
        status: "ok",
        output: "YES\n",
        error: "",
        exitCode: 0,
        timeMs: 15,
        memoryKb: 6336,
        truncated: false,
      },
    ],
  });
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
  await waitFor(() => expect(apiFetcher).toHaveBeenCalledTimes(1));
  const [url, init] = apiFetcher.mock.calls[0] as [string, RequestInit];
  return { url, body: JSON.parse(String(init.body)) };
};

describe("Workspace", () => {
  beforeEach(() => jest.clearAllMocks());

  it("in a session, runs the cases it shows and submits on the judge", async () => {
    show();

    expect(read).toHaveBeenCalledWith(
      "/api/problems/statement?judge=codeforces&contestId=4&index=A",
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
    expect(screen.getByLabelText("Add a case of your own")).toBeTruthy();
    const { url, body } = await runAndReadRequest();
    expect(url).toBe("/api/run");
    expect(body.inputs).toEqual(["8\n"]);
    expect(await screen.findByText("All cases passed")).toBeTruthy();
  });

  it("for a visitor, names the fixed problem and sends no inputs", async () => {
    show(["watermelon"]);

    expect(read).toHaveBeenCalledWith(
      "/api/run/try/statement?problem=watermelon",
    );
    expect(
      screen
        .getByRole("link", { name: "Create an account" })
        .getAttribute("href"),
    ).toBe("/signup");
    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
    expect(screen.queryByLabelText("Add a case of your own")).toBeNull();
    const { url, body } = await runAndReadRequest();
    expect(url).toBe("/api/run/try");
    expect(Object.keys(body).sort()).toEqual(["code", "language", "problem"]);
    expect(body.problem).toBe("watermelon");
    expect(await screen.findByText("All cases passed")).toBeTruthy();
  });
});
