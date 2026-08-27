const crypto = require('crypto');
const nodemailer = require('nodemailer');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}[character]));

const flatten = (value) => Array.isArray(value) ? value.join(', ') : String(value ?? '');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const body = req.body || {};

    // Honeypot field: silently accept bot submissions without sending email.
    if (body.website) {
      return res.status(200).json({ ok: true, reference: `AE-${Date.now().toString().slice(-6)}` });
    }

    const firstName = flatten(body.firstName).trim();
    const lastName = flatten(body.lastName).trim();
    const customerEmail = flatten(body.email).trim();
    const formType = flatten(body.formType).trim() || 'Website inquiry';

    if (!firstName || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return res.status(400).json({ message: 'Please provide a valid name and email address.' });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const recipient = process.env.CONTACT_TO_EMAIL || gmailUser;

    if (!gmailUser || !gmailAppPassword || !recipient) {
      return res.status(503).json({ message: 'The website email account has not been configured yet.' });
    }

    const reference = `AE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const ignoredFields = new Set(['attachment', 'website']);
    const rows = Object.entries(body)
      .filter(([key, value]) => !ignoredFields.has(key) && flatten(value).trim())
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
        return `<tr><th style="text-align:left;padding:8px 12px;border-bottom:1px solid #ddd;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #ddd">${escapeHtml(flatten(value)).replace(/\n/g, '<br>')}</td></tr>`;
      })
      .join('');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    const attachments = [];
    if (body.attachment?.data && body.attachment?.name) {
      attachments.push({
        filename: String(body.attachment.name).replace(/[^a-zA-Z0-9._-]/g, '_'),
        content: body.attachment.data,
        encoding: 'base64',
        contentType: body.attachment.type || 'application/octet-stream'
      });
    }

    await transporter.sendMail({
      from: `Advanced Embroidery Website <${gmailUser}>`,
      to: recipient,
      replyTo: customerEmail,
      subject: `${formType} · ${firstName} ${lastName} · ${reference}`,
      html: `<div style="font-family:Arial,sans-serif;color:#17202a"><h1 style="color:#0b2038">${escapeHtml(formType)}</h1><p>New website submission. Reference <strong>${reference}</strong>.</p><table style="border-collapse:collapse;width:100%">${rows}</table></div>`,
      text: `New ${formType}\nReference: ${reference}\n\n${Object.entries(body).filter(([key,value]) => !ignoredFields.has(key) && flatten(value).trim()).map(([key,value]) => `${key}: ${flatten(value)}`).join('\n')}`,
      attachments
    });

    return res.status(200).json({ ok: true, reference });
  } catch (error) {
    console.error('Contact form email error:', error);
    return res.status(500).json({ message: 'We could not send your request right now.' });
  }
};
