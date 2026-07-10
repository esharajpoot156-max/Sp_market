import axios from "axios";

const sendEmail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.SMTP_FROM, name: "Sp.market" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Brevo API email error:", error.response?.data || error.message);
    throw error;
  }
};

export default sendEmail;