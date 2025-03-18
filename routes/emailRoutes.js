import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailRouter = express.Router();
// export async function sendEmail({ to, subject, text, html }) {
//   try {
//     //configuring Gmail SMTP
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD
//       }
//     });
//     //defining email options
//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       text,
//       html
//     };
//     //sending email
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfullt to ${to}`);
//   } catch (error) {
//     console.log("Failed to send an email");
//   }
// }

emailRouter.post("/send-email", async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    //defining email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    };
    //sending email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfullt to ${to}`);
    res.status(200).json({
      message: "Email sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send an email"
    });
  }
});

export default emailRouter;
