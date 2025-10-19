// Business logic: Notification

const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // nodemailer is optional at runtime; provide a clear warning and defer throwing until email is actually needed
  console.warn('nodemailer is not installed. Email notifications will be disabled. Run `npm install nodemailer` in the Backend folder to enable email sending.');
}

/**
 * Helper: create nodemailer transporter.
 * Uses SMTP config from env:
 *  - SMTP_HOST
 *  - SMTP_PORT
 *  - SMTP_USER
 *  - SMTP_PASS
 *  - FROM_EMAIL (optional)
 *
 * Falls back to Ethereal test account if no SMTP config is provided (dev-friendly).
 */
async function createTransporter() {
  if (!nodemailer) {
    // Throw a readable error only when createTransporter is invoked (so server can still run)
    throw new Error('nodemailer is not installed. Run `npm install nodemailer` in the Backend directory to enable email notifications.');
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Send emails to a list of addresses.
 * Returns an array of send results (info objects).
 */
async function sendEmails(recipients = [], subject, text, html) {
  if (!recipients || recipients.length === 0) return [];

  const transporter = await createTransporter();
  const from = process.env.FROM_EMAIL || transporter.options.auth?.user || 'no-reply@example.com';

  const sendPromises = recipients.map((to) =>
    transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
  );

  const settled = await Promise.allSettled(sendPromises);

  // Attach preview URL (Ethereal) when available so front-end / API caller can inspect the message
  const results = await Promise.all(settled.map(async (r) => {
    if (r.status !== 'fulfilled') return { ok: false, error: r.reason };
    const info = r.value;
    // nodemailer.getTestMessageUrl returns a preview URL for Ethereal messages, otherwise undefined
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    return { ok: true, info, previewUrl: previewUrl || null };
  }));

  return results;
}

/**
 * Create a notification (persist + email recipients)
 * POST /api/notifications
 * body: { title, message, targetRole }
 * req.user.id is the creator (set by auth middleware)
 */
const createNotification = async (req, res) => {
  const { title, message, targetRole } = req.body;
  if (!title || !message || !targetRole) {
    throw new BadRequestError('title, message and targetRole are required');
  }

  // persist notification
  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      targetRole,
      createdBy: req.user?.id || null
    }
  });

  // find recipients by role
  const users = await prisma.user.findMany({
    where: { role: targetRole },
    select: { email: true, name: true }
  });

  const emails = users.map(u => u.email).filter(Boolean);

  // send emails (async)
  const subject = `Notification: ${title}`;
  const text = message;
  const html = `<p>${message}</p>`;

  const emailResults = await sendEmails(emails, subject, text, html);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Notification created and dispatched',
    data: {
      notification,
      emailSummary: {
        totalRecipients: emails.length,
        results: emailResults.slice(0, 10) // keep payload size reasonable
      }
    }
  });
};

/**
 * Get notifications.
 * - ADMIN: return all notifications
 * - others: return notifications targeted to their role
 */
const getNotifications = async (req, res) => {
  const userRole = req.user?.role;

  const where = userRole === 'ADMIN' ? {} : { targetRole: userRole };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notifications fetched successfully',
    data: notifications
  });
};

const getNotificationById = async (req, res) => {
  const id = Number(req.params.id);
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new NotFoundError('Notification not found');

  // Authorization: non-admins can only read notifications targeted to them
  if (req.user?.role !== 'ADMIN' && notification.targetRole !== req.user?.role) {
    throw new NotFoundError('Notification not found'); // hide existence
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: notification
  });
};

const deleteNotification = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Notification not found');

  await prisma.notification.delete({ where: { id } });

  res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  deleteNotification
};
