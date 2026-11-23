import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

export type ParsedStatement = {
  title: string;
  /** As the judge words it: "2 seconds", "2 sec". */
  timeLimit: string;
  memoryLimit: string;
  /** The statement as cleaned HTML. Formulas are still TeX: `$$$x$$$` on Codeforces, `<var>x</var>` on AtCoder. */
  html: string;
  samples: { input: string; output: string }[];
  /** AtCoder keeps its samples, with their explanations, inside the statement. */
  samplesInBody: boolean;
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

/** A Codeforces problem page. Null when the page holds no statement. */
export function parseCodeforcesStatement(page: string): ParsedStatement | null {
  const $ = cheerio.load(page);
  const root = $('.problem-statement').first();
  if (!root.length) return null;

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
  const samples = root
    .find('.sample-test')
    .first()
    .find('.input pre')
    .map((i, input) => {
      const output = root.find('.sample-test .output pre').get(i);
      return output ? { input: pre(input), output: pre(output) } : null;
    })
    .get()
    .filter(Boolean);

  const body = root.clone();
  body.find('.header, .sample-tests').remove();
  body.find('.section-title').each((_, el) => {
    $(el).replaceWith(`<h3>${$(el).text()}</h3>`);
  });

  return {
    title: oneLine(root.find('.header .title').first().text()),
    timeLimit: limit('.time-limit'),
    memoryLimit: limit('.memory-limit'),
    html: clean(body.html() ?? '', 'https://codeforces.com/'),
    samples,
    samplesInBody: false,
  };
}

/** An AtCoder task page: the English statement when there is one. Null without a statement. */
export function parseAtcoderStatement(page: string): ParsedStatement | null {
  const $ = cheerio.load(page);
  const all = $('#task-statement').first();
  if (!all.length) return null;
  const english = all.find('.lang-en').first();
  const root = english.length ? english : all;

  const samples: ParsedStatement['samples'] = [];
  root.find('h3').each((_, el) => {
    const heading = oneLine($(el).text());
    const text = sampleText($(el).nextAll('pre').first().text());
    const input = /^(Sample Input|入力例)\s*(\d+)/.exec(heading);
    const output = /^(Sample Output|出力例)\s*(\d+)/.exec(heading);
    if (input) samples[Number(input[2]) - 1] = { input: text, output: '' };
    else if (output && samples[Number(output[2]) - 1])
      samples[Number(output[2]) - 1].output = text;
  });

  const limits = /Time Limit:\s*([^/<]+)\/\s*Memory Limit:\s*([^<\n]+)/.exec(
    $('#task-statement').parent().text(),
  );
  // "E - Dice Product 3", with the page's own controls taken out of the heading
  const heading = $('span.h2').first().clone();
  heading.find('a, button').remove();

  return {
    title: oneLine(heading.text()),
    timeLimit: oneLine(limits?.[1] ?? ''),
    memoryLimit: oneLine(limits?.[2] ?? ''),
    html: clean(root.html() ?? '', 'https://atcoder.jp/'),
    samples: samples.filter((s) => s && s.output),
    samplesInBody: true,
  };
}
