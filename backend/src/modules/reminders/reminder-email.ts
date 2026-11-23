export type ReminderProblem = {
  contestId: number;
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

/** Weekly "you still owe these" email. `pending` must be oldest first. */
export function renderReminderEmail(
  handle: string,
  pending: ReminderProblem[],
  links: { upsolve: string; unsubscribe: string },
  nowMs: number = Date.now(),
) {
  const oldest = daysSince(pending[0].createdAt, nowMs);
  const subject = `You owe ${plural(pending.length, 'problem')}, the oldest is ${plural(oldest, 'day')} old`;
  const top = pending.slice(0, 5);
  const text = [
    `Hi ${handle},`,
    '',
    `${plural(pending.length, 'problem')} still waiting in your upsolve list:`,
    ...top.map(
      (p) =>
        `- ${p.contestId}${p.index} ${p.name} (${plural(daysSince(p.createdAt, nowMs), 'day')}) ${p.url}`,
    ),
    '',
    `Open your list: ${links.upsolve}`,
    `Stop these emails: ${links.unsubscribe}`,
  ].join('\n');
  const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;color:#183123">
<p>Hi ${escapeHtml(handle)},</p>
<p><strong>${plural(pending.length, 'problem')}</strong> still waiting in your upsolve list. One today is enough.</p>
<ul>${top
    .map(
      (p) =>
        `<li><a href="${escapeHtml(p.url)}">${p.contestId}${escapeHtml(p.index)} ${escapeHtml(p.name)}</a> · ${plural(daysSince(p.createdAt, nowMs), 'day')}</li>`,
    )
    .join('')}</ul>
<p><a href="${escapeHtml(links.upsolve)}">Open your upsolve list</a></p>
<p style="font-size:12px;color:#667">You asked for this weekly reminder on Upsolve.it. <a href="${escapeHtml(links.unsubscribe)}">Stop these emails</a>.</p>
</div>`;
  return { subject, text, html };
}

export function renderConfirmEmail(handle: string, confirmUrl: string) {
  return {
    subject: 'Confirm your Upsolve.it reminder email',
    text: `Hi ${handle},\n\nConfirm this address to get a weekly upsolve reminder:\n${confirmUrl}\n\nThe link works for 24 hours. If you didn't ask for this, ignore this email.`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px;color:#183123"><p>Hi ${escapeHtml(handle)},</p><p><a href="${escapeHtml(confirmUrl)}">Confirm this address</a> to get a weekly upsolve reminder.</p><p style="font-size:12px;color:#667">The link works for 24 hours. If you didn't ask for this, ignore this email.</p></div>`,
  };
}
