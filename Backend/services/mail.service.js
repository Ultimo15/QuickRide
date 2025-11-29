const { createTransport } = require("nodemailer");

// ✅ CONFIGURACIÓN CORRECTA PARA RENDER
const transport = createTransport({
  host: "smtp.gmail.com",
  port: 587, // ⚡️ Puerto 587 (TLS) - Render bloquea 465
  secure: false, // ⚡️ FALSE para puerto 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  family: 4, // Forzar IPv4
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 segundos de timeout
  greetingTimeout: 10000,
});

const sendMail = async (to, subject, html) => {
  try {
    console.log(`🚀 Intentando enviar a: ${to} usando puerto 587 (TLS)...`);
    
    const info = await transport.sendMail({
      from: `"QuickRide Support" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log("✅ Correo enviado exitosamente ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ FALLÓ EL ENVÍO:", error.message);
    console.error("📋 Detalles del error:", error);
    throw new Error("No se pudo enviar el correo: " + error.message);
  }
};

module.exports = {
  sendMail,
};