const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, content) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.content = content;
    this.from = `Quiz <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "development") {
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_ACCOUNT,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject, html) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendNewPassword() {
    const subject = "Your new password";
    const html = `<p>Hi ${this.firstName},</p>
                  <p>Your new password is: ${this.content}</p>`;
    await this.send(subject, html);
  }
};
