import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  console.log("🟡 sendEmail called →", { to, subject });
  console.log("🟡 SMTP config →", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // 👈 explicitly false for port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Sp.market" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("🟢 Email sent successfully →", info.response);
  } catch (err) {
    console.error("🔴 Email send FAILED →", err.message);
    throw err;
  }
};

export default sendEmail;