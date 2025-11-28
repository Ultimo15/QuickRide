const { createTransport } = require("nodemailer");

// Usamos el servicio 'gmail' predefinido para evitar líos de puertos
const transport = createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    // DIAGNÓSTICO: Esto aparecerá en tus logs antes de intentar enviar
    // Si sale "undefined", es que las variables no están bien puestas en Render
    console.log("Intentando enviar correo desde:", process.env.MAIL_USER);

    const info = await transport.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    
    console.log("Email enviado con éxito:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error fatal enviando correo:", error);
    throw error;
  }
};

module.exports = {
  sendMail,
};
