// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_USER, // your gmail
//     pass: process.env.SMTP_PASS, // app password
//   },
// });

// module.exports.sendMail = async ({ to, subject, html }) => {
//   await transporter.sendMail({
//     from: `"Kalyanamalai" <${process.env.SMTP_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };


const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports.sendMail = async ({ to, subject, html }) => {
  try {
    console.log("📨 Mail send start");
    console.log("➡️ To:", to);
    console.log("➡️ Subject:", subject);

    const info = await transporter.sendMail({
      from: `"Kalyanamalai" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Mail sent successfully");
    console.log("📩 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);

    return info;
  } catch (error) {
    console.error("❌ Mail sending failed");
    console.error("🔥 Error:", error.message);
    throw error; // important – controller catch-ku poganum
  }
};
