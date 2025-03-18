import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmail({ to, subject, text, html }) {
  try {
    //configuring Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "email-smtp.ap-south-1.amazonaws.com", //process.env.SMTP_HOST,
      port: 25, //process.env.SMTPS_PORT,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Ignore self-signed certificate error
      }
    });
    //defining email options
    const mailOptions = {
      from: "pongangairamannks2000@gmail.com", // process.env.EMAIL_FROM,
      to: "ashishiit9@gmail.com",
      subject,
      text,
      html
    };

    //sending email
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message %s sent: %s", info.messageId, info.response);
    });
    console.log(`Email sent successfullt to ${to}`);
  } catch (error) {
    console.log("Failed to send an email");
  }
}
