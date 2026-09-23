const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let emailData = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: title,
      html: body,
    });

    return emailData;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;
