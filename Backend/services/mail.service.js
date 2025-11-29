const { Resend } = require('resend');

// Inicializar Resend con la API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Función para enviar correos
const sendMail = async (to, subject, html) => {
  try {
    console.log('📧 Iniciando envío de correo...');
    console.log('📬 Destinatario:', to);
    console.log('📝 Asunto:', subject);
    console.log('🔐 API Key configurada:', process.env.RESEND_API_KEY ? '✅ SÍ' : '❌ NO');

    // Validar que la API Key esté configurada
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada en las variables de entorno');
    }

    // Enviar el correo con Resend
    const { data, error } = await resend.emails.send({
      from: 'QuickRide <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    // Si Resend devuelve un error
    if (error) {
      console.error('❌ Error de Resend:', error);
      throw new Error(error.message || 'Error desconocido al enviar correo');
    }

    // Éxito
    console.log('✅ Correo enviado exitosamente');
    console.log('📬 ID del correo:', data.id);
    
    return data;
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO AL ENVIAR CORREO:');
    console.error('📋 Mensaje:', error.message);
    console.error('🔍 Stack:', error.stack);
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendMail,
};