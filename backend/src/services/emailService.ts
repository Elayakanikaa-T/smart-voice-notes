/**
 * Email Service using Nodemailer
 * Supports Gmail Service (auto port 465 SSL) and custom SMTP.
 * Strips whitespace/spaces from App Passwords to prevent copy-paste errors.
 */
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

export function getEmailTransporter() {
  const user = (process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.EMAIL_PASS || '').trim();
  // Strip any spaces Google puts in 16-char app passwords (e.g., "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = rawPass.replace(/\s+/g, '');

  const isPlaceholder =
    !user ||
    !pass ||
    user === 'your-gmail-address@gmail.com' ||
    pass === 'your-16-char-app-password';

  if (isPlaceholder) {
    return null;
  }

  const host = (process.env.EMAIL_HOST || '').trim();
  const isGmail = user.endsWith('@gmail.com') || host.includes('gmail');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
    auth: {
      user,
      pass,
    },
  });
}

// Log status on startup
const initialTransporter = getEmailTransporter();
if (!initialTransporter) {
  logger.warn(
    '[EmailService] ⚠️  SMTP is NOT configured. ' +
    'Set EMAIL_USER and EMAIL_PASS in environment to enable real OTP delivery.'
  );
} else {
  logger.info('[EmailService] ✅ SMTP transporter initialized successfully.');
}

interface ReminderEmailOptions {
  to: string;
  toName: string;
  subject: string;
  body: string;
  meetingTitle: string;
  taskText: string;
  dueDate?: Date;
  isOverdue: boolean;
}

export async function sendReminderEmail(opts: ReminderEmailOptions): Promise<void> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    logger.debug(`[EmailService] No SMTP configured, skipping email to ${opts.to}`);
    return;
  }

  const dueDateStr = opts.dueDate
    ? new Date(opts.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not set';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Inter,Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
    <div style="background:${opts.isOverdue ? 'linear-gradient(135deg,#dc2626,#9b2c2c)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)'};padding:32px 24px;">
      <h1 style="margin:0;font-size:22px;color:#fff;">${opts.subject}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Employee Meeting Portal</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="margin:0 0 16px;">Hi <strong>${opts.toName}</strong>,</p>
      <p style="margin:0 0 24px;line-height:1.6;">${opts.body}</p>
      <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;margin-bottom:24px;">
        <div style="margin-bottom:12px;">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Meeting</span>
          <p style="margin:4px 0 0;font-weight:600;">${opts.meetingTitle}</p>
        </div>
        <div style="margin-bottom:12px;">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Task</span>
          <p style="margin:4px 0 0;font-weight:600;">${opts.taskText}</p>
        </div>
        <div>
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">Due Date</span>
          <p style="margin:4px 0 0;font-weight:600;color:${opts.isOverdue ? '#f87171' : '#34d399'};">${dueDateStr}</p>
        </div>
      </div>
      <p style="color:#64748b;font-size:12px;margin:0;">This is an automated notification from the Employee Meeting Portal.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Meeting Portal" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: opts.to,
    subject: opts.subject,
    html,
  });

  logger.info(`[EmailService] Reminder email sent to ${opts.to}`);
}

export interface OTPEmailOptions {
  to: string;
  toName?: string;
  otp: string;
}

export async function sendOTPEmail(opts: OTPEmailOptions): Promise<void> {
  const recipient = opts.toName || 'User';
  logger.info(`[EmailService] Preparing OTP delivery to ${opts.to}`);

  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error(
      'Email service is not configured on the server. Please set EMAIL_USER and EMAIL_PASS environment variables.'
    );
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0b0f19;color:#e2e8f0;margin:0;padding:20px;">
  <div style="max-width:520px;margin:30px auto;background:#131c2e;border-radius:18px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:30px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Smart Voice Notes</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">Account Email Verification</p>
    </div>
    <div style="padding:32px 28px;">
      <p style="margin:0 0 16px;font-size:15px;color:#f8fafc;">Hello <strong>${recipient}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
        Use the following one-time verification code (OTP) to complete your signup process. This code confirms your identity and will expire in <strong>10 minutes</strong>.
      </p>
      
      <div style="background:#090d16;border-radius:14px;padding:24px;text-align:center;border:1px solid #243048;margin-bottom:24px;">
        <span style="display:block;font-size:11px;font-weight:700;color:#818cf8;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Your Verification Code</span>
        <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#ffffff;text-shadow:0 0 12px rgba(99,102,241,0.5);">${opts.otp}</div>
        <span style="display:block;font-size:12px;color:#64748b;margin-top:8px;">Valid for 10 minutes</span>
      </div>

      <p style="margin:0 0 8px;font-size:12px;color:#64748b;line-height:1.5;">
        If you did not request this verification code, please ignore this email or contact security support. Do not share this OTP with anyone.
      </p>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #1e293b;font-size:11px;color:#475569;text-align:center;">
        Smart Voice Notes Security & Authentication System
      </div>
    </div>
  </div>
</body>
</html>`;

  const sender = (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@smartvoicenotes.com').trim();

  try {
    await transporter.sendMail({
      from: `"Smart Voice Notes" <${sender}>`,
      to: opts.to,
      subject: `Your Smart Voice Notes Verification Code: ${opts.otp}`,
      html,
    });
    logger.info(`[EmailService] OTP email sent successfully to ${opts.to}`);
  } catch (err: any) {
    logger.error(`[EmailService] Failed to send OTP email: ${err.message}`);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
}

export interface MeetingInviteEmailOptions {
  to: string;
  toName?: string;
  organizerName: string;
  meetingTitle: string;
  scheduledAt?: Date | string;
  dueTime?: string;
  agenda?: string;
  meetingLink: string;
}

export async function sendMeetingInviteEmail(opts: MeetingInviteEmailOptions): Promise<void> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    logger.debug(`[EmailService] No SMTP configured, skipping invite email to ${opts.to}`);
    return;
  }

  const dateFormatted = opts.scheduledAt
    ? new Date(opts.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Immediate / Live Session';

  const timeFormatted = opts.dueTime || 'Starting Now';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#070b14;color:#e2e8f0;margin:0;padding:24px;">
  <div style="max-width:580px;margin:30px auto;background:#0d1526;border-radius:20px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 25px 50px rgba(0,0,0,0.6);">
    <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:32px 28px;text-align:left;">
      <span style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.15);border-radius:20px;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">Meeting Invitation</span>
      <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;line-height:1.3;">${opts.meetingTitle}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Invited by <strong>${opts.organizerName}</strong></p>
    </div>

    <div style="padding:32px 28px;">
      <p style="margin:0 0 20px;font-size:15px;color:#f8fafc;">
        Hi ${opts.toName ? `<strong>${opts.toName}</strong>` : 'there'}, you've been invited to join a live meeting session on <strong>Smart Voice Notes</strong>.
      </p>

      <div style="background:#080d19;border-radius:14px;padding:20px;border:1px solid #1e293b;margin-bottom:24px;">
        <div style="display:flex;margin-bottom:12px;">
          <div style="margin-right:24px;">
            <span style="font-size:11px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Scheduled Date</span>
            <strong style="font-size:14px;color:#ffffff;">${dateFormatted}</strong>
          </div>
          <div>
            <span style="font-size:11px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Time / Due</span>
            <strong style="font-size:14px;color:#ffffff;">${timeFormatted}</strong>
          </div>
        </div>
        ${opts.agenda ? `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid #1a2538;">
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;display:block;">Agenda</span>
          <p style="margin:4px 0 0;font-size:13px;color:#cbd5e1;line-height:1.5;">${opts.agenda}</p>
        </div>` : ''}
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${opts.meetingLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:12px;box-shadow:0 10px 20px rgba(79,70,229,0.35);">
          Join Live Meeting Room →
        </a>
        <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Or paste this link into your browser: <br/><a href="${opts.meetingLink}" style="color:#818cf8;word-break:break-all;">${opts.meetingLink}</a></p>
      </div>

      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #1e293b;font-size:11px;color:#475569;text-align:center;">
        Smart Voice Notes Meeting Intelligence & Audio Transcription Platform
      </div>
    </div>
  </div>
</body>
</html>`;

  const sender = (process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@smartvoicenotes.com').trim();

  try {
    await transporter.sendMail({
      from: `"${opts.organizerName} (via Smart Voice Notes)" <${sender}>`,
      to: opts.to,
      subject: `Meeting Invite: ${opts.meetingTitle}`,
      html,
    });
    logger.info(`[EmailService] Meeting invite sent successfully to ${opts.to}`);
  } catch (err: any) {
    logger.warn(`[EmailService] Failed to send meeting invite to ${opts.to}: ${err.message}`);
  }
}

