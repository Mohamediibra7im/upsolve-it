import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

/** A part of a statement. "other" is anything a judge adds, under its own title. */
export type StatementSection = {
  kind: 'story' | 'constraints' | 'input' | 'output' | 'note' | 'other';
  /** The judge's heading, for a part we have no name for ("Interaction"). */
  title?: string;
  /** Cleaned HTML. Formulas are still TeX: `$$$x$$$` on Codeforces, `<var>x</var>` on AtCoder. */
  html: string;
};

/**
 * Raised whenever a statement comes out of this file differently, so that
 * copies kept from before are read again from the judge.
 */
export const PARSER_VERSION = 2;

export type ParsedStatement = {
  /** The problem's name, without its letter. */
  title: string;
  /** As the judge words it: "2 seconds", "2 sec". */
  timeLimit: string;
  memoryLimit: string;
  sections: StatementSection[];
  /** `note` is the judge's explanation of that sample, as cleaned HTML. */
  samples: { input: string; output: string; note?: string }[];
};

/**
 * What a statement may contain once it is ours to show. Everything else is
 * dropped: scripts, styles, forms, event handlers, and every attribute but a
 * link's address and an image's source. A judge's page is not ours, so it is
 * treated as untrusted input.
 */
const clean = (html: string, base: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      ...['p', 'br', 'hr', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code'],
      ...['b', 'strong', 'i', 'em', 'u', 's', 'sub', 'sup', 'span', 'div'],
      ...['h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ...['img', 'var', 'details', 'summary', 'a'],
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    // Older Codeforces problems draw each formula as a small picture. The one
    // class that says so is kept, so the page can set those in the line of
    // text they belong to instead of treating them as figures.
    allowedClasses: { img: ['tex-formula'] },
    allowedSchemes: ['https'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      // every link leaves the site, in a new tab
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          href: absolute(attribs.href, base),
          target: '_blank',
          rel: 'noreferrer noopener',
        },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, src: absolute(attribs.src, base) },
      }),
      // Codeforces marks emphasis with classes, which do not survive cleaning
      span: (tagName, attribs) => {
        const style = /tex-font-style-(bf|it|tt)/.exec(
          attribs.class ?? '',
        )?.[1];
        const tag = { bf: 'b', it: 'i', tt: 'code' }[style ?? ''];
        return { tagName: tag ?? tagName, attribs: {} };
      },
    },
  }).trim();

/** A page-relative address as a full https one; anything unusable becomes empty. */
function absolute(address: string | undefined, base: string) {
  try {
    const url = new URL(address ?? '', base);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();
/** Sample text with Unix newlines and exactly one at the end. */
const sampleText = (text: string) =>
  `${text.replace(/\r\n?/g, '\n').replace(/\s+$/, '')}\n`;

/** "D. Sum It" and "E - Dice Product 3" without the letter. */
const withoutLetter = (title: string) =>
  title.replace(/^[A-Za-z]\d?\s*[.-]\s+/, '');

/** A Codeforces problem page. Null when the page holds no statement. */
export function parseCodeforcesStatement(page: string): ParsedStatement | null {
  const $ = cheerio.load(page);
  const root = $('.problem-statement').first();
  if (!root.length) return null;
  const base = 'https://codeforces.com/';

  const limit = (selector: string) => {
    const el = root.find(`.header ${selector}`).first().clone();
    el.find('.property-title').remove();
    return oneLine(el.text());
  };
  // A sample is either plain text with <br>, or one <div> per line.
  const pre = (el: Parameters<typeof $>[0]) => {
    const node = $(el);
    const lines = node.find('.test-example-line');
    if (lines.length)
      return sampleText(
        lines
          .map((_, l) => $(l).text())
          .get()
          .join('\n'),
      );
    node.find('br').replaceWith('\n');
    return sampleText(node.text());
  };
  const outputs = root.find('.sample-test .output pre').get();
  const samples = root
    .find('.sample-test .input pre')
    .get()
    .flatMap((input, i) =>
      outputs[i] ? [{ input: pre(input), output: pre(outputs[i]) }] : [],
    );

  const KINDS: Record<string, StatementSection['kind']> = {
    'input-specification': 'input',
    'output-specification': 'output',
    note: 'note',
  };
  const sections: StatementSection[] = [];
  root.children().each((_, el) => {
    const part = $(el).clone();
    const name = (part.attr('class') ?? '').split(/\s+/)[0];
    if (name === 'header' || name === 'sample-tests') return;
    const heading = part.children('.section-title').first();
    const title = oneLine(heading.text());
    heading.remove();
    const html = clean(part.html() ?? '', base);
    if (!html) return;
    const kind = KINDS[name] ?? (title ? 'other' : 'story');
    sections.push(kind === 'other' ? { kind, title, html } : { kind, html });
  });
  if (!sections.length) return null;

  return {
    title: withoutLetter(oneLine(root.find('.header .title').first().text())),
    timeLimit: limit('.time-limit'),
    memoryLimit: limit('.memory-limit'),
    sections,
    samples,
  };
}

/** An AtCoder task page: the English statement when there is one. Null without a statement. */
export function parseAtcoderStatement(page: string): ParsedStatement | null {
  const $ = cheerio.load(page);
  const all = $('#task-statement').first();
  if (!all.length) return null;
  const english = all.find('.lang-en').first();
  const root = english.length ? english : all;
  const base = 'https://atcoder.jp/';

  const KINDS: [RegExp, StatementSection['kind']][] = [
    [/^(Problem Statement|問題文)$/, 'story'],
    [/^(Constraints|制約)$/, 'constraints'],
    [/^(Input|入力)$/, 'input'],
    [/^(Output|出力)$/, 'output'],
    [/^(Notes?|注意|注記)$/, 'note'],
  ];
  const sections: StatementSection[] = [];
  const samples: ParsedStatement['samples'] = [];
  // Every part of an AtCoder statement is a <section> under its own <h3>.
  root.find('section').each((_, el) => {
    const part = $(el).clone();
    const heading = part.children('h3').first();
    const title = oneLine(heading.text());
    heading.remove();

    const input = /^(Sample Input|入力例)\s*(\d+)/.exec(title);
    const output = /^(Sample Output|出力例)\s*(\d+)/.exec(title);
    if (input || output) {
      const n = Number((input ?? output)![2]) - 1;
      const block = part.children('pre').first();
      const text = sampleText(block.text());
      block.remove();
      if (input) samples[n] = { input: text, output: '' };
      else if (samples[n]) {
        samples[n].output = text;
        // what follows the output is the judge's explanation of the sample
        const note = clean(part.html() ?? '', base);
        if (note) samples[n].note = note;
      }
      return;
    }

    const html = clean(part.html() ?? '', base);
    if (!html) return;
    const kind = KINDS.find(([name]) => name.test(title))?.[1] ?? 'other';
    sections.push(kind === 'other' ? { kind, title, html } : { kind, html });
  });
  if (!sections.length) return null;

  const limits = /Time Limit:\s*([^/<]+)\/\s*Memory Limit:\s*([^<\n]+)/.exec(
    all.parent().text(),
  );
  // "E - Dice Product 3", with the page's own controls taken out of the heading
  const heading = $('span.h2').first().clone();
  heading.find('a, button').remove();

  return {
    title: withoutLetter(oneLine(heading.text())),
    timeLimit: oneLine(limits?.[1] ?? ''),
    memoryLimit: oneLine(limits?.[2] ?? ''),
    sections,
    samples: samples.filter((sample) => sample && sample.output),
  };
}
