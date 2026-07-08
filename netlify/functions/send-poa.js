const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      pdfBase64,
      filename,
      signerName,
      signerPhone,
      signerCity,
      signerEmail,
      accidentDate,
      signDate
    } = JSON.parse(event.body);

    if (!pdfBase64 || !signerName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Email credentials not configured on server' }) };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `AyudaLegalTX <${GMAIL_USER}>`,
      to: GMAIL_USER,
      subject: `✍ POA FIRMADO (PDF adjunto) — ${signerName} (${signerCity || '—'})`,
      text: [
        `Autorización firmada digitalmente — lista para reenviar a Haque Law.`,
        ``,
        `Cliente: ${signerName}`,
        `Teléfono: ${signerPhone || '—'}`,
        `Email: ${signerEmail || '—'}`,
        `Ciudad: ${signerCity || '—'}`,
        `Fecha del accidente: ${accidentDate || '—'}`,
        `Fecha de firma: ${signDate || '—'}`,
        ``,
        `El PDF de 4 páginas (Power of Attorney, Exhibit A, Autorización médica/laboral) está adjunto a este correo.`
      ].join('\n'),
      attachments: [
        {
          filename: filename || `POA-${signerName}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ]
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
