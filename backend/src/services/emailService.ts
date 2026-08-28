/**
 * Email Service using Nodemailer
 * Gracefully no-ops if EMAIL_HOST is not configured.
 */
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = process.env.EMAIL_HOST
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    })
  : null;

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
