const fillTemplate = ({ name, link, type }) => {
  if (type === "verification") {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
          .button { background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          h1 { color: #333; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>¡Hola ${name}!</h1>
          <p>Gracias por registrarte en QuickRide. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
          <a href="${link}" class="button">Verificar mi correo</a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="color: #999; font-size: 12px;">${link}</p>
          <p>Este enlace expirará en 15 minutos.</p>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de QuickRide</p>
        </div>
      </body>
      </html>
    `;
  } else if (type === "reset-password") {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
          .button { background-color: #ff5722; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          h1 { color: #333; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Restablecer contraseña</h1>
          <p>Hola ${name},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña de QuickRide. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="${link}" class="button">Restablecer contraseña</a>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="color: #999; font-size: 12px;">${link}</p>
          <p>Este enlace expirará en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          <p>Saludos,<br>El equipo de QuickRide</p>
        </div>
      </body>
      </html>
    `;
  }
};

module.exports = { fillTemplate };