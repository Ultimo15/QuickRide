const { createTransport } = require("nodemailer");

// ✅ CONFIGURACIÓN CORRECTA PARA RENDER CON GMAIL
const transport = createTransport({
  host: "smtp.gmail.com",
  port: 587, // Puerto 587 (TLS) - Compatible con Render
  secure: false, // FALSE para puerto 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Debe ser la contraseña de aplicación de 16 dígitos
  },
  family: 4, // Forzar IPv4
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 segundos de timeout
  greetingTimeout: 10000,
});

// ✅ Verificar la conexión al iniciar
transport.verify(function (error, success) {
  if (error) {
    console.error("❌ Error en la configuración de NodeMailer:", error);
  } else {
    console.log("✅ Servidor de correo listo para enviar mensajes");
  }
});

const sendMail = async (to, subject, html) => {
  try {
    console.log(`🚀 Intentando enviar correo a: ${to}`);
    console.log(`📧 Usuario SMTP: ${process.env.MAIL_USER}`);
    console.log(`🔐 Password configurada: ${process.env.MAIL_PASS ? '✅ SÍ' : '❌ NO'}`);
    
    const info = await transport.sendMail({
      from: `"QuickRide Support" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log("✅ Correo enviado exitosamente");
    console.log("📬 Message ID:", info.messageId);
    return info;
    
  } catch (error) {
    console.error("❌ ERROR AL ENVIAR CORREO:");
    console.error("📋 Mensaje:", error.message);
    console.error("🔍 Código:", error.code);
    console.error("📊 Response:", error.response);
    console.error("🗂️ Stack completo:", error.stack);
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendMail,
};