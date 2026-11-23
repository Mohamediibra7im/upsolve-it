import { renderConfirmEmail, renderReminderEmail } from './reminder-email';

describe('renderReminderEmail', () => {
  const now = Date.UTC(2026, 10, 23);
  const problem = (name: string, daysOld: number) => ({
    contestId: 2000,
    index: 'C',
    name,
    url: 'https://codeforces.com/problemset/problem/2000/C',
    createdAt: new Date(now - daysOld * 86_400_000),
  });

  it('states the debt and the age of the oldest problem', () => {
    const mail = renderReminderEmail(
      'tourist',
      [problem('Old', 23), problem('New', 1)],
      { upsolve: 'https://app/upsolve', unsubscribe: 'https://app/email?t=x' },
      now,
    );
    expect(mail.subject).toBe('You owe 2 problems, the oldest is 23 days old');
    expect(mail.text).toContain('2000C New (1 day)');
    expect(mail.text).toContain('https://app/email?t=x');
    expect(mail.html).toContain('Stop these emails');
  });

  it('counts re-solves due next to the waiting problems', () => {
    const mail = renderReminderEmail(
      'tourist',
      [problem('Old', 23)],
      { upsolve: 'https://app/upsolve', unsubscribe: 'https://app/email?t=x' },
      now,
      2,
    );
    expect(mail.subject).toBe('You owe 1 problem, the oldest is 23 days old');
    expect(mail.text).toContain('2 re-solves due');
    expect(mail.html).toContain('2 re-solves due.');
  });

  it('is still worth sending with only re-solves due', () => {
    const mail = renderReminderEmail(
      'tourist',
      [],
      { upsolve: 'https://app/upsolve', unsubscribe: 'https://app/email?t=x' },
      now,
      1,
    );
    expect(mail.subject).toBe('1 re-solve due in your upsolve queue');
    expect(mail.text).not.toContain('still waiting');
    expect(mail.html).toContain('1 re-solve due.');
  });

  it('escapes names and handles in the HTML body', () => {
    const mail = renderReminderEmail(
      '<b>h</b>',
      [problem('A <script> & B', 2)],
      { upsolve: 'u', unsubscribe: 'x' },
      now,
    );
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('A &lt;script&gt; &amp; B');
    expect(mail.html).toContain('&lt;b&gt;h&lt;/b&gt;');
  });
});

describe('renderConfirmEmail', () => {
  it('carries the confirm link and escapes the handle', () => {
    const url = 'https://app/email?action=confirm&token=a.b';
    const mail = renderConfirmEmail('<i>h</i>', url);
    expect(mail.text).toContain(url);
    expect(mail.html).toContain(
      'href="https://app/email?action=confirm&amp;token=a.b"',
    );
    expect(mail.html).toContain('&lt;i&gt;h&lt;/i&gt;');
    // the logo comes from the same site as the link
    expect(mail.html).toContain('src="https://app/brand/icon-192.png"');
  });
});
