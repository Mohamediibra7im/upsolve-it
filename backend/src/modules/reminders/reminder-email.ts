import { LOGO_CID } from './email-logo';

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
  onVolt: '#0b0c0a',
  voltMuted: '#364406',
  failed: '#ff7a7a',
};
const FONT = {
  display: `'Barlow Condensed','Arial Narrow',Arial,sans-serif`,
  text: `Barlow,'Helvetica Neue',Helvetica,Arial,sans-serif`,
  mono: `'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace`,
};

/** A full address of the site, or empty when the setting is not one. */
const siteOf = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
};

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${C.volt}" style="border-radius:3px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 22px;font:800 16px/18px ${FONT.display};letter-spacing:1px;text-transform:uppercase;color:${C.onVolt};text-decoration:none">${label} &rarr;</a></td>
</tr></table>`;
}

const paragraph = (html: string) =>
  `<p style="margin:0 0 20px;font:400 16px/25px ${FONT.text};color:${C.muted}">${html}</p>`;
const strong = (html: string) =>
  `<span style="color:${C.ink};font-weight:600">${html}</span>`;
const footLink = (label: string, href: string) =>
  `<a href="${escapeHtml(href)}" style="color:${C.ink};text-decoration:underline">${label}</a>`;

/**
 * One frame for every email. From the top: the brand, a volt block that
 * names the email in a few words, the body, a box that says in a sentence
 * what the email is for and why this person got it, and the footer.
 */
function layout(opts: {
  /** Any address of the site: the footer links to its front page. */
  site: string;
  /** Shown by mail apps next to the subject. */
  preview: string;
  /** The kind of email, in two or three words. */
  eyebrow: string;
  title: string;
  /** Already-escaped HTML. */
  body: string;
  /** Already-escaped HTML: what this email is for and why it was sent. */
  about: string;
  /** Already-escaped HTML: what to do if it is not wanted. */
  footer: string;
}) {
  const site = siteOf(opts.site);
  const home = site
    ? `<a href="${escapeHtml(site)}" style="color:${C.ink};text-decoration:underline">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a> &middot; `
    : '';
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
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.ground}" style="background:${C.ground}"><tr><td align="center" style="padding:28px 12px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px">
<tr><td style="padding:0 4px 18px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:12px"><img src="cid:${LOGO_CID}" width="40" height="40" alt="Upsolve It" style="display:block;border:0;border-radius:11px"></td>
<td style="font:700 22px/40px ${FONT.text};letter-spacing:-0.9px;color:${C.ink}">Upsolve <span style="font-weight:500;color:${C.volt}">It</span></td>
</tr></table>
</td></tr>
<tr><td bgcolor="${C.volt}" style="background:${C.volt};padding:26px 28px 24px">
<p style="margin:0 0 10px;font:600 11px/16px ${FONT.mono};letter-spacing:1.4px;text-transform:uppercase;color:${C.voltMuted}">${opts.eyebrow}</p>
<h1 style="margin:0;font:800 38px/36px ${FONT.display};text-transform:uppercase;color:${C.onVolt}">${opts.title}</h1>
</td></tr>
<tr><td bgcolor="${C.surface}" style="background:${C.surface};border:1px solid ${C.line};border-top:0;padding:28px 28px 26px">
${opts.body}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px"><tr>
<td bgcolor="${C.sunk}" style="background:${C.sunk};padding:16px 18px">
<p style="margin:0 0 4px;font:600 14px/20px ${FONT.text};color:${C.ink}">What this email is for</p>
<p style="margin:0;font:400 14px/22px ${FONT.text};color:${C.muted}">${opts.about}</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:20px 4px 0;font:400 13px/21px ${FONT.text};color:${C.muted}">
${opts.footer}
<p style="margin:14px 0 0">${home}Upsolve It was built under the ${footLink('HNU - FCSIT ICPC Community', 'https://hnuicpc.tech')} by ${footLink('Mohamed Ibrahim', 'https://mohamediibrahim.dev/')}.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

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
    '',
    `This is your weekly reminder from Upsolve It, for the account ${handle}. You get it because the weekly reminder is switched on in your settings.`,
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
    ? `${paragraph(`Hi ${escapeHtml(handle)}, the oldest one has been in your upsolve queue for ${strong(plural(oldest, 'day'))}. One today is enough.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-bottom:1px solid ${C.line}">${rows}${more}</table>`
    : paragraph(`Hi ${escapeHtml(handle)}, nothing new is waiting.`);
  const resolveHtml = resolveDue
    ? paragraph(
        `${strong(`${resolves} due.`)} Problems you solved, back to check that the idea stuck.`,
      )
    : '';

  const html = layout({
    site: links.upsolve,
    preview: pending.length
      ? `The oldest has been waiting ${plural(oldest, 'day')}. One today is enough.`
      : resolveText,
    eyebrow: 'Weekly reminder &middot; your upsolve queue',
    title: pending.length ? `${waiting} still waiting.` : `${resolves} due.`,
    body: `${queue}
${resolveHtml}${button('Open your upsolve queue', links.upsolve)}`,
    about: `Your weekly reminder from Upsolve It, for the account ${strong(escapeHtml(handle))}. It lists the problems you missed in a contest or a training session and have not solved yet. It is sent once a week, and only when something is waiting.`,
    footer: `You get this because the weekly reminder is switched on in your settings. ${footLink('Stop these emails', links.unsubscribe)}.`,
  });
  return { subject, text, html };
}

/** Why a 6-digit code is being mailed. Each one is worded for what the person was doing. */
export type CodePurpose = 'signup' | 'settings' | 'reset';

const CODE_EMAILS: Record<
  CodePurpose,
  {
    subject: (code: string) => string;
    eyebrow: string;
    title: string;
    /** After "Hi name, ". */
    lead: string;
    /** The page the code is typed on, and the label of the button to it. */
    path: string;
    open: string;
    about: (name: string) => string;
    /** For someone who did not ask for it. */
    ignore: string;
  }
> = {
  signup: {
    subject: (code) =>
      `${code} is your code to finish signing up for Upsolve It`,
    eyebrow: 'Sign-up &middot; step 2 of 3',
    title: 'Confirm your email.',
    lead: 'you are creating an Upsolve It account. Type this code on the sign-up page to confirm this address, then connect your judge.',
    path: '/signup',
    open: 'Back to sign-up',
    about: (name) =>
      `Someone is creating the Upsolve It account ${name} with this email address. The code proves the address is theirs. Once it is confirmed, the account can log in with it and reset its password by email.`,
    ignore:
      'If this was not you, ignore this email: without the code the address is not attached to any account.',
  },
  settings: {
    subject: (code) => `${code} confirms the email you added to Upsolve It`,
    eyebrow: 'Account email',
    title: 'Confirm your new email.',
    lead: 'you added this address to your Upsolve It account. Type this code in Settings, under Account email, to confirm it.',
    path: '/settings#settings-account',
    open: 'Open Settings',
    about: (name) =>
      `The account ${name} asked to use this address as its account email. The code proves the address is yours. Once it is confirmed, you can log in with it, reset your password by email, and get the weekly reminder here if you switch it on.`,
    ignore:
      'If this was not you, ignore this email: without the code the address is not attached to any account.',
  },
  reset: {
    subject: (code) => `${code} is your Upsolve It password reset code`,
    eyebrow: 'Password reset',
    title: 'Reset your password.',
    lead: 'someone asked to reset the password of your Upsolve It account. Type this code on the reset page to choose a new one.',
    path: '/reset-password',
    open: 'Open the reset page',
    about: (name) =>
      `A password reset was started for the account ${name}, which uses this email address. The code lets whoever has it set a new password, once.`,
    ignore:
      'If this was not you, ignore this email: your password stays as it is, and nobody can change it without this code. Never share the code.',
  },
};

/** The six digits, one to a tile, as the site draws a countdown. */
const codeTiles = (code: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px"><tr>${[
    ...code,
  ]
    .map(
      (digit, i) =>
        `${i ? '<td width="6" style="font-size:0;line-height:0">&nbsp;</td>' : ''}<td width="40" height="54" align="center" bgcolor="${C.sunk}" style="background:${C.sunk};border:1px solid ${C.line};border-bottom:2px solid ${C.volt};border-radius:2px;font:600 28px/54px ${FONT.mono};color:${C.volt}">${digit}</td>`,
    )
    .join('')}</tr></table>`;

/**
 * The 6-digit code that proves an email address: at sign-up, when an address
 * is added in Settings, or to reset a password. `appUrl` is the site's own
 * address; with one, the email links to the page the code is typed on.
 */
export function renderCodeEmail(
  name: string,
  code: string,
  appUrl: string,
  purpose: CodePurpose,
) {
  const mail = CODE_EMAILS[purpose];
  const site = siteOf(appUrl);
  const page = site ? `${site}${mail.path}` : '';
  const safeName = escapeHtml(name);
  return {
    subject: mail.subject(code),
    text: [
      `Hi ${name},`,
      '',
      `${mail.lead[0].toUpperCase()}${mail.lead.slice(1)}`,
      '',
      `Your code: ${code}`,
      'It works for 10 minutes, and only once.',
      ...(page ? ['', `${mail.open}: ${page}`] : []),
      '',
      `What this email is for: ${mail.about(name)}`,
      mail.ignore,
    ].join('\n'),
    html: layout({
      site: appUrl,
      preview: `Your code is ${code}. It works for 10 minutes.`,
      eyebrow: mail.eyebrow,
      title: mail.title,
      body: `${paragraph(`Hi ${strong(safeName)}, ${mail.lead}`)}
${codeTiles(code)}
<p style="margin:0 0 ${page ? 22 : 0}px;font:500 12px/18px ${FONT.mono};color:${C.muted}">Works for 10 minutes &middot; one use</p>
${page ? button(mail.open, page) : ''}`,
      about: mail.about(strong(safeName)),
      footer: mail.ignore,
    }),
  };
}
