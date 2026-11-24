import { renderCodeEmail, renderReminderEmail } from './reminder-email';

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

describe('renderCodeEmail', () => {
  const site = 'https://app.example';

  it('says what each code is for, where to type it, and carries the code', () => {
    const signup = renderCodeEmail('mona', '482017', site, 'signup');
    expect(signup.subject).toBe(
      '482017 is your code to finish signing up for Upsolve It',
    );
    expect(signup.text).toContain('Your code: 482017');
    expect(signup.html).toContain('on the sign-up page');
    expect(signup.html).toContain('href="https://app.example/signup"');

    const settings = renderCodeEmail('mona', '111222', site, 'settings');
    expect(settings.subject).toBe(
      '111222 confirms the email you added to Upsolve It',
    );
    expect(settings.html).toContain('in Settings, under Account email');
    expect(settings.html).not.toContain('sign-up page');
    expect(settings.html).toContain(
      'href="https://app.example/settings#settings-account"',
    );

    const reset = renderCodeEmail('mona', '333444', site, 'reset');
    expect(reset.subject).toBe('333444 is your Upsolve It password reset code');
    expect(reset.html).toContain('on the reset page');
    expect(reset.html).toContain('your password stays as it is');
    expect(reset.html).toContain('href="https://app.example/reset-password"');

    for (const mail of [signup, settings, reset]) {
      expect(mail.html).toContain('What this email is for');
      expect(mail.text).toContain('What this email is for:');
    }
  });

  it('shows the logo from inside the message, not from the site', () => {
    const mail = renderCodeEmail('mona', '482017', site, 'signup');
    expect(mail.html).toContain('src="cid:upsolve-it-logo"');
    expect(mail.html).not.toContain('/brand/icon-192.png');
  });

  it('escapes the name, and leaves out links when the site has no address', () => {
    const mail = renderCodeEmail('<i>h</i>', '482017', '', 'reset');
    expect(mail.html).toContain('&lt;i&gt;h&lt;/i&gt;');
    expect(mail.html).not.toContain('<i>h</i>');
    expect(mail.html).not.toContain('reset-password');
  });
});
