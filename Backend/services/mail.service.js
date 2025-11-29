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
```

5. **Scroll abajo** y toca **"Commit changes"**
6. **Toca "Commit changes"** de nuevo

---

#### **C) Actualizar mail.controller.js:**

1. **En GitHub**, ve a: `Backend/controllers/mail.controller.js`
2. **Toca el ícono del lápiz** (editar)
3. **Borra TODO** el contenido actual
4. **Copia y pega** el código que te di anteriormente (el mail.controller.js completo y corregido de mi respuesta anterior)
5. **Commit changes**

---

### **Paso 4: Forzar redeploy en Render**

1. **Vuelve a Render**: https://dashboard.render.com
2. **Toca tu servicio** "quickride-backend"
3. **Toca "Manual Deploy"** en la parte superior
4. **Selecciona** "Clear build cache & deploy"
5. **Toca "Deploy"**

---

### **Paso 5: Verificar los logs**

1. **Mientras se hace el deploy**, toca **"Logs"** en el menú
2. **Espera** a que termine (unos 2-3 minutos)
3. **Busca** este mensaje:
```
   ✅ Servidor de correo listo para enviar mensajes
