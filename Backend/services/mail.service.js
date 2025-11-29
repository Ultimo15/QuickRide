const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to, subject, html) => {
  try {
    console.log(`🚀 Enviando correo a: ${to}`);
    console.log(`🔐 API Key configurada: ${process.env.RESEND_API_KEY ? '✅ SÍ' : '❌ NO'}`);
    
    const { data, error } = await resend.emails.send({
      from: 'QuickRide <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      throw new Error(error.message);
    }

    console.log('✅ Correo enviado exitosamente');
    console.log('📬 Email ID:', data.id);
    return data;
    
  } catch (error) {
    console.error('❌ ERROR AL ENVIAR CORREO:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendMail,
};