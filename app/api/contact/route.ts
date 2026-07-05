import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function esc(s: string): string {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, category, message } = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('SMTP credentials are not configured in environment variables');
      return NextResponse.json(
        { success: false, error: 'Email service is not configured.' },
        { status: 500 }
      );
    }

    const escName = esc(name);
    const escEmail = esc(email);
    const escSubject = esc(subject);
    const escCategory = esc(category ?? 'general');
    const escMessage = esc(message);

    // Configure your SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Professional Email Template for the Admin (You)
    const adminMailOptions = {
      from: `"Upsolve.it Support" <${emailUser}>`,
      to: emailUser,
      subject: `[Support Inquiry] ${escSubject} (${escCategory.toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #007F5F;">New Support Transmission</h2>
          <p><strong>From:</strong> ${escName} (${escEmail})</p>
          <p><strong>Category:</strong> ${escCategory}</p>
          <p><strong>Subject:</strong> ${escSubject}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${escMessage}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Transmitted from Upsolve.it Signal Support</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email Transmission Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transmit signal. Please try again later.' },
      { status: 500 }
    );
  }
}
