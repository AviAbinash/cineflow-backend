import { sendEmail } from "./sendEmail.js";

sendEmail({
  to: "ashishiit9@gmail.com",
  subject: "Test Email",
  text: "Plain text",
  html: "<h1>This is a h1 tag</h1>"
})
  .then(() => console.log("Test Email Sent Successfully"))
  .catch(() => console.log("Error Sending Test Email"));
