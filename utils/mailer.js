const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // your gmail
    pass: process.env.SMTP_PASS, // app password
  },
});

module.exports.sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Kalyanamalai" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
