const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (to, subject, html) => {
  try {
    console.log('📧 Enviando correo con SendGrid...');
    console.log('📬 Destinatario:', to);
    console.log('📝 Asunto:', subject);
    console.log('🔐 API Key configurada:', process.env.SENDGRID_API_KEY ? '✅ SÍ' : '❌ NO');

    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY no configurada');
    }

    const msg = {
      to: to,
      from: 'lilnazx1115@gmail.com', // ← TU EMAIL VERIFICADO
      subject: subject,
      html: html,
    };

    const response = await sgMail.send(msg);
    
    console.log('✅ Correo enviado exitosamente');
    console.log('📬 Status Code:', response[0].statusCode);
    
    return response;
    
  } catch (error) {
    console.error('❌ ERROR AL ENVIAR CORREO:');
    console.error('📋 Mensaje:', error.message);
    
    if (error.response) {
      console.error('🔍 Código:', error.code);
      console.error('📊 Response:', error.response.body);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendMail,
};