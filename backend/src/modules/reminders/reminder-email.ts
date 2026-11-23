export type ReminderProblem = {
  contestId: number | string;
  index: string;
  name: string;
  url: string;
  createdAt: Date;
};

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

const daysSince = (date: Date, nowMs: number) =>
  Math.max(0, Math.floor((nowMs - date.getTime()) / 86_400_000));

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ---------- The look: the site's "Track" design, in email-safe HTML ----------
// Tables and inline styles only, because mail apps drop most CSS. The web
// fonts load where the app allows them (Apple Mail, iOS); elsewhere the
// fallbacks keep the same shape: a narrow bold face and a monospace.
const C = {
  ground: '#0b0c0a',
  surface: '#151712',
  sunk: '#1f221b',
  line: '#2b2f26',
  ink: '#f2f4ec',
  muted: '#aab19d',
  volt: '#c8f52a',
  failed: '#ff7a7a',
};
const FONT = {
  display: `'Barlow Condensed','Arial Narrow',Arial,sans-serif`,
  text: `Barlow,'Helvetica Neue',Helvetica,Arial,sans-serif`,
  mono: `'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace`,
};
const eyebrowStyle = `font:600 11px/16px ${FONT.mono};letter-spacing:1.2px;text-transform:uppercase;color:${C.muted}`;

/** The site's address, for the logo. Empty when the link is not a full URL. */
const originOf = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${C.volt}" style="border-radius:3px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 22px;font:800 16px/18px ${FONT.display};letter-spacing:1px;text-transform:uppercase;color:${C.ground};text-decoration:none">${label}</a></td>
</tr></table>`;
}

/** One frame for every email: the brand, a headline, the body and a footer. */
function layout(opts: {
  /** The site address the logo is loaded from. */
  origin: string;
  /** Shown by mail apps next to the subject. */
  preview: string;
  eyebrow: string;
  title: string;
  /** Already-escaped HTML. */
  body: string;
  /** Already-escaped HTML: why you got this, and how to stop it. */
  footer: string;
}) {
  const mark = opts.origin
    ? `<img src="${escapeHtml(opts.origin)}/brand/icon-192.png" width="30" height="30" alt="" style="display:block;border:0;border-radius:8px">`
    : `<div style="width:30px;height:30px;border-radius:8px;background:${C.volt};color:${C.ground};font:800 18px/30px ${FONT.text};text-align:center">U</div>`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Barlow:wght@400;600&family=JetBrains+Mono:wght@500;600&display=swap">
</head>
<body style="margin:0;padding:0;background:${C.ground}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${opts.preview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.ground}" style="background:${C.ground}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td style="padding:0 4px 20px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:10px">${mark}</td>
<td style="font:700 20px/30px ${FONT.text};letter-spacing:-0.8px;color:${C.ink}">Upsolve <span style="font-weight:500;color:${C.volt}">It</span></td>
</tr></table>
</td></tr>
<tr><td bgcolor="${C.surface}" style="background:${C.surface};border:1px solid ${C.line};border-top:3px solid ${C.volt};padding:32px 28px">
<p style="margin:0 0 10px;${eyebrowStyle}">${opts.eyebrow}</p>
<h1 style="margin:0 0 16px;font:800 34px/34px ${FONT.display};text-transform:uppercase;color:${C.ink}">${opts.title}</h1>
${opts.body}
</td></tr>
<tr><td style="padding:20px 4px 0;font:400 13px/20px ${FONT.text};color:${C.muted}">
${opts.footer}
<p style="margin:14px 0 0;${eyebrowStyle}">Built under the HNU - FCSIT ICPC Community</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const paragraph = (html: string) =>
  `<p style="margin:0 0 20px;font:400 16px/25px ${FONT.text};color:${C.muted}">${html}</p>`;
const footLink = (label: string, href: string) =>
  `<a href="${escapeHtml(href)}" style="color:${C.ink};text-decoration:underline">${label}</a>`;

/**
 * Weekly "you still owe these" email. `pending` must be oldest first, and
 * either it or `resolveDue` (re-solves that have come due) is not empty.
 */
export function renderReminderEmail(
  handle: string,
  pending: ReminderProblem[],
  links: { upsolve: string; unsubscribe: string },
  nowMs: number = Date.now(),
  resolveDue = 0,
) {
  const waiting = plural(pending.length, 'problem');
  const resolves = plural(resolveDue, 're-solve');
  const oldest = pending.length ? daysSince(pending[0].createdAt, nowMs) : 0;
  const subject = pending.length
    ? `You owe ${waiting}, the oldest is ${plural(oldest, 'day')} old`
    : `${resolves} due in your upsolve queue`;
  const resolveText = `${resolves} due: problems you solved, back to check that the idea stuck.`;
  const top = pending.slice(0, 5);
  const text = [
    `Hi ${handle},`,
    '',
    ...(pending.length
      ? [
          `${waiting} still waiting in your upsolve list:`,
          ...top.map(
            (p) =>
              `- ${p.contestId}${p.index} ${p.name} (${plural(daysSince(p.createdAt, nowMs), 'day')}) ${p.url}`,
          ),
          '',
        ]
      : []),
    ...(resolveDue ? [resolveText, ''] : []),
    `Open your list: ${links.upsolve}`,
    `Stop these emails: ${links.unsubscribe}`,
  ].join('\n');

  // The queue as the site draws it: a numbered slot, the problem, its age.
  const rows = top
    .map(
      (p, i) => `<tr>
<td width="44" valign="top" style="padding:14px 0;border-top:1px solid ${C.line}"><div style="width:32px;height:32px;border-radius:2px;background:${C.sunk};box-shadow:inset 0 0 0 2px ${C.failed};font:600 13px/32px ${FONT.mono};color:${C.ink};text-align:center">${i + 1}</div></td>
<td valign="top" style="padding:14px 0;border-top:1px solid ${C.line}"><a href="${escapeHtml(p.url)}" style="font:600 16px/20px ${FONT.text};color:${C.ink};text-decoration:none">${escapeHtml(p.name)}</a><div style="margin-top:3px;font:500 12px/16px ${FONT.mono};color:${C.muted}">${escapeHtml(String(p.contestId))}${escapeHtml(p.index)} &middot; waiting ${plural(daysSince(p.createdAt, nowMs), 'day')}</div></td>
</tr>`,
    )
    .join('');
  const more =
    pending.length > top.length
      ? `<tr><td colspan="2" style="padding:12px 0;border-top:1px solid ${C.line};font:500 12px/16px ${FONT.mono};color:${C.muted}">+ ${pending.length - top.length} more in your queue</td></tr>`
      : '';
  const queue = pending.length
    ? `${paragraph(`Hi ${escapeHtml(handle)}, the oldest one has been in your upsolve queue for <span style="color:${C.ink};font-weight:600">${plural(oldest, 'day')}</span>. One today is enough.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-bottom:1px solid ${C.line}">${rows}${more}</table>`
    : paragraph(`Hi ${escapeHtml(handle)}, nothing new is waiting.`);
  const resolveHtml = resolveDue
    ? paragraph(
        `<span style="color:${C.ink};font-weight:600">${resolves} due.</span> Problems you solved, back to check that the idea stuck.`,
      )
    : '';

  const html = layout({
    origin: originOf(links.upsolve),
    preview: pending.length
      ? `The oldest has been waiting ${plural(oldest, 'day')}. One today is enough.`
      : resolveText,
    eyebrow: 'Weekly reminder',
    title: pending.length ? `${waiting} still waiting.` : `${resolves} due.`,
    body: `${queue}
${resolveHtml}${button('Open your upsolve queue', links.upsolve)}`,
    footer: `You asked for this weekly reminder on Upsolve It. ${footLink('Stop these emails', links.unsubscribe)}.`,
  });
  return { subject, text, html };
}

export function renderConfirmEmail(handle: string, confirmUrl: string) {
  return {
    subject: 'Confirm your Upsolve It reminder email',
    text: `Hi ${handle},\n\nConfirm this address to get a weekly upsolve reminder:\n${confirmUrl}\n\nThe link works for 24 hours. If you didn't ask for this, ignore this email.`,
    html: layout({
      origin: originOf(confirmUrl),
      preview: 'One click and your weekly upsolve reminder is on.',
      eyebrow: 'Confirm your email',
      title: 'One click to switch your reminder on.',
      body: `${paragraph(`Hi ${escapeHtml(handle)}, confirm this address and once a week we will send you the problems still waiting in your upsolve queue. Nothing is sent when the queue is clear.`)}
${button('Confirm this address', confirmUrl)}
<p style="margin:24px 0 0;font:400 13px/20px ${FONT.text};color:${C.muted}">If the button does not work, open this link:<br><a href="${escapeHtml(confirmUrl)}" style="font:500 12px/18px ${FONT.mono};color:${C.ink};word-break:break-all">${escapeHtml(confirmUrl)}</a></p>`,
      footer: `The link works for 24 hours. If you didn't ask for this, ignore this email and nothing will be sent.`,
    }),
  };
}
