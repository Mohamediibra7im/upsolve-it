import katex from "katex";

/** A formula as HTML. A formula KaTeX cannot read is shown as its source, never as an error. */
const tex = (source: string, displayMode: boolean) =>
  katex.renderToString(source, {
    displayMode,
    throwOnError: false,
    strict: "ignore",
    output: "html",
  });

/** The statement HTML is escaped; a formula inside it has to be plain text again for KaTeX. */
const unescape = (text: string) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/**
 * Turns the formulas of a cleaned statement into typeset math. Codeforces
 * writes `$$$x$$$` inline and `$$$$$$x$$$$$$` on a line of its own; AtCoder
 * wraps a formula in `<var>`. The rest of the HTML is left exactly as it is.
 */
export function renderStatementMath(html: string) {
  return html
    .replace(/\$\$\$\$\$\$([\s\S]+?)\$\$\$\$\$\$/g, (_, source: string) =>
      tex(unescape(source), true),
    )
    .replace(/\$\$\$([\s\S]+?)\$\$\$/g, (_, source: string) =>
      tex(unescape(source), false),
    )
    .replace(/<var>([\s\S]*?)<\/var>/g, (_, source: string) =>
      tex(unescape(source), false),
    );
}
