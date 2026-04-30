const Bravo = require("@getbrevo/brevo");
const apiInstance = new Bravo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Bravo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

class EmailService {
  async sendEmail(toEmail, subject, content) {
    const sendSmtpEmail = {
      sender: {
        name: "E-commerce",
        email: "mohamedelsefi11@gmail.com",
      },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: content,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}

module.exports = EmailService;
