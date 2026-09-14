const crypto = require('crypto');
const nodemailer = require('nodemailer');

const TO_EMAIL = 'mpimentel1363@gmail.com';
const MAX_ATTACHMENT_BYTES = 2_500_000;

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

const flatten = (value) =>
  Array.isArray(value) ? value.join(', ') : String(value ?? '');

const labelFor = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase());

function decodeAttachment(attachment) {
  if (!attachment?.data || !attachment?.name) return null;

  const raw = String(attachment.data || '');
  const estimatedBytes = Math.floor((raw.length * 3) / 4);

  if (estimatedBytes > MAX_ATTACHMENT_BYTES) {
    throw new Error('ATTACHMENT_TOO_LARGE');
  }

  return {
    filename: String(attachment.name).replace(/[^a-zA-Z0-9._-]/g, '_'),
    content: raw,
    encoding: 'base64',
    contentType: attachment.type || 'application/octet-stream'
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const body = req.body || {};

    // Honeypot: silently accept obvious bot submissions without sending mail.
    if (body.website) {
      return res.status(200).json({
        ok: true,
        reference: `AE-${Date.now().toString().slice(-6)}`
      });
    }

    const firstName = flatten(body.firstName).trim();
    const lastName = flatten(body.lastName).trim();
    const customerEmail = flatten(body.email).trim().toLowerCase();
    const formType = flatten(body.formType).trim() || 'Website inquiry';

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: 'Please provide your first and last name.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.'
      });
    }

    const gmailUser = String(process.env.GMAIL_USER || '').trim();
    const gmailAppPassword = String(
      process.env.GMAIL_APP_PASSWORD || ''
    ).replace(/\s+/g, '');

    if (!gmailUser || !gmailAppPassword) {
      console.error('Advanced contact email is missing Gmail environment variables.');
      return res.status(503).json({
        message: 'The website email service is not configured yet.'
      });
    }

    const reference = `AE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const ignoredFields = new Set(['attachment', 'website']);

    const submittedFields = Object.entries(body).filter(
      ([key, value]) =>
        !ignoredFields.has(key) &&
        flatten(value).trim()
    );

    const rows = submittedFields
      .map(([key, value]) => {
        const safeValue = escapeHtml(flatten(value)).replace(/\n/g, '<br>');
        return `<tr>
          <th style="text-align:left;padding:9px 12px;border-bottom:1px solid #e4e8ec;vertical-align:top;width:180px;color:#0b2038">${escapeHtml(labelFor(key))}</th>
          <td style="padding:9px 12px;border-bottom:1px solid #e4e8ec;color:#17202a">${safeValue}</td>
        </tr>`;
      })
      .join('');

    const textFields = submittedFields
      .map(([key, value]) => `${labelFor(key)}: ${flatten(value)}`)
      .join('\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    const attachment = decodeAttachment(body.attachment);
    const attachments = attachment ? [attachment] : [];

    await transporter.sendMail({
      from: `Advanced Embroidery Website <${gmailUser}>`,
      to: TO_EMAIL,
      replyTo: customerEmail,
      subject: `[Advanced Website] ${formType} · ${firstName} ${lastName} · ${reference}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#17202a;max-width:760px;margin:0 auto">
          <div style="background:#0b2038;color:#fff;padding:22px 26px;border-radius:16px 16px 0 0">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d8e3ec">Advanced Embroidery Website</div>
            <h1 style="margin:5px 0 0;font-size:26px;line-height:1.2">${escapeHtml(formType)}</h1>
          </div>
          <div style="border:1px solid #dce2e7;border-top:0;padding:24px 26px;border-radius:0 0 16px 16px">
            <p style="margin-top:0">New website submission from <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong>.</p>
            <p>Reference: <strong>${reference}</strong></p>
            <table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
            <p style="margin:22px 0 0;font-size:13px;color:#5e6875">Reply directly to this email to respond to ${escapeHtml(customerEmail)}.</p>
          </div>
        </div>
      `,
      text:
        `Advanced Embroidery Website\n` +
        `${formType}\n` +
        `Reference: ${reference}\n\n` +
        `${textFields}`,
      attachments
    });

    return res.status(200).json({
      ok: true,
      reference
    });
  } catch (error) {
    console.error('Advanced website email error:', error);

    if (error instanceof Error && error.message === 'ATTACHMENT_TOO_LARGE') {
      return res.status(413).json({
        message: 'The artwork file is too large. Please upload a file smaller than 2.5 MB.'
      });
    }

    return res.status(500).json({
      message: 'We could not send your request right now. Please try again or call 508-678-8993.'
    });
  }
};
