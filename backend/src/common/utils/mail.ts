import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { LOGO_CID, LOGO_PNG_BASE64 } from '../../modules/reminders/email-logo';

export type Mail = { subject: string; text: string; html: string };

/** True when the site has a mailbox to send from. */
export function mailConfigured(config: ConfigService) {
  return Boolean(config.get('SMTP_EMAIL') && config.get('SMTP_PASSWORD'));
}

/** Sends one email from the site's own address. */
export async function sendMail(config: ConfigService, to: string, mail: Mail) {
  const from = config.get<string>('SMTP_EMAIL');
  const pass = config.get<string>('SMTP_PASSWORD');
  if (!from || !pass)
    throw new ServiceUnavailableException('Email is not configured.');
  await nodemailer
    .createTransport({ service: 'gmail', auth: { user: from, pass } })
    .sendMail({
      from: `"Upsolve It" <${from}>`,
      to,
      ...mail,
      // The picture the template shows as the logo, inside the message.
      attachments: mail.html.includes(`cid:${LOGO_CID}`)
        ? [
            {
              filename: 'upsolve-it.png',
              content: Buffer.from(LOGO_PNG_BASE64, 'base64'),
              contentType: 'image/png',
              cid: LOGO_CID,
            },
          ]
        : [],
    });
}
