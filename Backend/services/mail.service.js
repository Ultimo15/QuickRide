const { createTransport } = require("nodemailer");

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 465,       // Puerto seguro SSL
  secure: true,    // Obligatorio true para 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // Opciones extra para evitar bloqueos de red
  tls: {
    rejectUnauthorized: false 
  },
  connectionTimeout: 10000, // Esperar solo 10 segundos antes de fallar
});

const sendMail = async (to, subject, html) => {
  try {
    console.log(`Intentando enviar correo desde: ${process.env.MAIL_USER} hacia ${to}`);
    
    const info = await transport.sendMail({
      from: `"QuickRide Support" <${process.env.MAIL_USER}>`, // Formato más profesional
      to,
      subject,
      html,
    });

    console.log("✅ Correo enviado. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    // Importante: No lanzamos el error (throw) para que no tumbe tu servidor, 
    // pero devolvemos false para que sepas que falló.
    return null; 
  }
};

module.exports = {
  sendMail,
};
