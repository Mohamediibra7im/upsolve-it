import { sameOutput } from "../compareOutput";
import { renderStatementMath } from "../statementMath";
import { submitUrl } from "../submitUrl";

describe("sameOutput", () => {
  it("ignores spacing and line breaks", () => {
    expect(sameOutput("2\n-1\n", "2\n-1")).toBe(true);
    expect(sameOutput("1 2 3\n", "1\n2\n3\n")).toBe(true);
    expect(sameOutput("YES\n", "  YES  \n\n")).toBe(true);
  });

  it("does not ignore a wrong, missing or extra word", () => {
    expect(sameOutput("2\n-1\n", "2\n1\n")).toBe(false);
    expect(sameOutput("2\n-1\n", "2\n")).toBe(false);
    expect(sameOutput("2\n", "2\n-1\n")).toBe(false);
    expect(sameOutput("YES", "yes")).toBe(false);
    expect(sameOutput("3\n", "")).toBe(false);
  });
});

describe("renderStatementMath", () => {
  it("typesets Codeforces and AtCoder formulas and leaves the rest alone", () => {
    const html = renderStatementMath(
      "<p>Given $$$n \\le 10^5$$$ and <var>N</var>.</p><b>bold</b>",
    );
    expect(html).toContain('class="katex"');
    expect(html).not.toContain("$$$");
    expect(html).not.toContain("<var>");
    expect(html.startsWith("<p>Given ")).toBe(true);
    expect(html.endsWith("<b>bold</b>")).toBe(true);
  });

  it("sets a six-dollar formula on its own line", () => {
    expect(renderStatementMath("$$$$$$\\sum_{i=1}^{n} a_i$$$$$$")).toContain(
      "katex-display",
    );
  });

  it("reads the escaped signs of the HTML as the signs they are", () => {
    const html = renderStatementMath("$$$a &lt; b &amp; c$$$");
    expect(html).toContain("&lt;");
    expect(html).not.toContain("&amp;lt;");
  });

  it("shows a formula it cannot read as text, without throwing", () => {
    expect(() => renderStatementMath("$$$\\notacommand{$$$")).not.toThrow();
  });
});

describe("submitUrl", () => {
  it("opens the judge's submit page with the problem chosen", () => {
    expect(
      submitUrl({
        contestId: 1986,
        index: "D",
        url: "https://codeforces.com/contest/1986/problem/D",
      }),
    ).toBe("https://codeforces.com/problemset/submit/1986/D");
    expect(
      submitUrl({
        judge: "atcoder",
        contestId: "abc300",
        index: "E",
        url: "https://atcoder.jp/contests/abc300/tasks/abc300_e",
      }),
    ).toBe("https://atcoder.jp/contests/abc300/submit?taskScreenName=abc300_e");
  });
});
