import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter(): Promise<nodemailer.Transporter | null> {
  if (transporter) return transporter;

  try {
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("📧 Ethereal email:", testAccount.user);
    }
  } catch {
    console.warn("Email transporter unavailable — emails disabled.");
    return null;
  }

  return transporter;
}

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  try {
    const t = await getTransporter();
    if (!t) return;

    const info = await t.sendMail({
      from: `"Deci Techno" <${process.env.EMAIL_FROM || "noreply@decitechno.com"}>`,
      to,
      subject: "Welcome to Deci Techno!",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;padding:32px 24px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#6366f1;margin:0;font-size:28px;">Welcome to Deci Techno!</h1>
          </div>
          <p style="color:#1e293b;font-size:16px;line-height:1.6;">Hi ${name || "there"},</p>
          <p style="color:#64748b;font-size:15px;line-height:1.6;">
            Thank you for creating an account at <strong>Deci Techno</strong>! 
            You now have access to premium laptops, tablets, mobile phones, and smart watches.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/products" 
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
              Start Shopping
            </a>
          </div>
          <p style="color:#94a3b8;font-size:13px;text-align:center;margin-top:32px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `,
    });

    if (info.messageId && !process.env.SMTP_HOST) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.warn("Failed to send welcome email:", err instanceof Error ? err.message : err);
  }
}
