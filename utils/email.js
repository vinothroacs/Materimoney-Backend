const sendRejectionMail = async (toEmail, name, reason = "") => {
  try {
    await transporter.sendMail({
      from: `"Kalyanamalai Matrimony" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Profile Update ❌ | Kalyanamalai Matrimony",
      html: `
        <h2>Dear ${name},</h2>
        <p>Thank you for submitting your matrimony profile.</p>

        <p>After review, your profile could not be approved at this time.</p>

        ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}

        <p>You may login, update your details and submit again.</p>
        <br/>
        <b>– Kalyanamalai Matrimony Team</b>
      `,
    });

    console.log("📧 Rejection mail sent to:", toEmail);
  } catch (err) {
    console.error("❌ Rejection mail failed:", err.message);
  }
};

module.exports = {
  sendSignupMail,
  sendApprovalMail,
  sendRejectionMail,
};
