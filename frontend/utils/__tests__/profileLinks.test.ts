import { linkError, normalizeLink, profileLinkList } from "../profileLinks";

it("reduces a pasted profile URL to the username", () => {
  expect(normalizeLink("github", "https://github.com/octocat")).toBe("octocat");
  expect(normalizeLink("github", " github.com/octocat/ ")).toBe("octocat");
  expect(
    normalizeLink("github", "https://github.com/octocat/hello-world"),
  ).toBe("octocat");
  expect(
    normalizeLink("linkedin", "https://www.linkedin.com/in/mona-adel-1a2b3c/"),
  ).toBe("mona-adel-1a2b3c");
  expect(
    normalizeLink("linkedin", "https://eg.linkedin.com/in/mona-adel?trk=x"),
  ).toBe("mona-adel");
  expect(normalizeLink("x", "https://twitter.com/@jack")).toBe("jack");
  expect(normalizeLink("atcoder", "https://atcoder.jp/users/tourist")).toBe(
    "tourist",
  );
  expect(normalizeLink("leetcode", "leetcode.com/u/lee215/")).toBe("lee215");
  expect(
    normalizeLink(
      "codechef",
      "https://www.codechef.com/users/gennady.korotkevich",
    ),
  ).toBe("gennady.korotkevich");
});

it("keeps plain usernames, without a leading @", () => {
  expect(normalizeLink("github", "  octocat ")).toBe("octocat");
  expect(normalizeLink("x", "@jack")).toBe("jack");
  expect(linkError("github", "octo-cat")).toBeNull();
  expect(linkError("linkedin", "mona-adel-1a2b3c")).toBeNull();
  expect(linkError("github", "")).toBeNull();
});

it("leaves a URL of another platform alone and says what is expected", () => {
  const pasted = "https://www.linkedin.com/in/mona-adel";
  expect(normalizeLink("github", pasted)).toBe(pasted);
  expect(linkError("github", pasted)).toMatch(/GitHub username/);
  expect(normalizeLink("github", "https://evilgithub.com/octocat")).toMatch(
    /^https:/,
  );
  expect(linkError("github", "-octocat")).not.toBeNull();
  expect(linkError("x", "a".repeat(16))).not.toBeNull();
  expect(linkError("codechef", "gennady.korotkevich")).not.toBeNull();
});

it("accepts only https addresses for the website", () => {
  expect(normalizeLink("website", "your-site.com")).toBe(
    "https://your-site.com",
  );
  expect(linkError("website", "https://your-site.com/about")).toBeNull();
  for (const bad of [
    "http://your-site.com",
    "javascript:alert(1)",
    "data:text/html,hi",
    "https://user:pass@your-site.com",
    "https://localhost",
    "https://your-site.com/<script>",
  ]) {
    expect(linkError("website", normalizeLink("website", bad))).not.toBeNull();
  }
});

it("builds hrefs from usernames and drops anything that is not one", () => {
  expect(
    profileLinkList({
      github: "octocat",
      linkedin: "",
      x: "javascript:alert(1)",
      website: "https://your-site.com/",
      atcoder: "tourist",
    }),
  ).toEqual([
    {
      key: "github",
      label: "GitHub",
      username: "octocat",
      href: "https://github.com/octocat",
    },
    {
      key: "website",
      label: "Website",
      username: "your-site.com",
      href: "https://your-site.com/",
    },
    {
      key: "atcoder",
      label: "AtCoder",
      username: "tourist",
      href: "https://atcoder.jp/users/tourist",
    },
  ]);
  expect(profileLinkList(undefined)).toEqual([]);
});
