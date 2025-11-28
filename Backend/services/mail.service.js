const { createTransport } = require("nodemailer");

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 465,        // CAMBIADO: Puerto seguro SSL (Render no bloquea este)
  secure: true,     // CAMBIADO: 'true' es obligatorio para el puerto 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Esto asegura que si falla, tu servidor se entere
  }
};

module.exports = {
  sendMail,
};
