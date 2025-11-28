const transport = createTransport({
  host: "smtp.gmail.com",
  port: 587,          // <--- CAMBIO 1: Puerto 587 (TLS)
  secure: false,      // <--- CAMBIO 2: secure false (necesario para puerto 587)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendMail,
};
