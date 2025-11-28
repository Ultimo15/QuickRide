const { createTransport } = require("nodemailer");

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // ⚡️ ESTA ES LA SOLUCIÓN PARA RENDER ⚡️
  // Forzamos el uso de IPv4 porque Render a veces falla con IPv6 en Gmail
  family: 4, 
  tls: {
    rejectUnauthorized: false
  }
});

const sendMail = async (to, subject, html) => {
  try {
    console.log(`🚀 Intentando enviar a: ${to} usando IPv4...`);
    
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
    // Lanzamos el error para que el frontend sepa que falló
    throw new Error("No se pudo enviar el correo: " + error.message); 
  }
};

module.exports = {
  sendMail,
};
