import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    // Configure your SMTP transporter
    // NOTE: You should set these in your .env file
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'mohamed.ibra7im011@gmail.com', // Your email
        pass: process.env.EMAIL_PASS, // Your App Password (not your regular password)
      },
    });

    // Professional Email Template for the Admin (You)
    const adminMailOptions = {
      from: `"Upsolve.it Support" <${process.env.EMAIL_USER || 'mohamed.ibra7im011@gmail.com'}>`,
      to: 'mohamed.ibra7im011@gmail.com',
      subject: `[Support Inquiry] ${subject} (${category.toUpperCase()})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #007F5F;">New Support Transmission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
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
