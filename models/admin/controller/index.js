const { sendRejectionMail } = require("../../../utils/email");

exports.rejectUserForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { reason } = req.body; // optional reject reason

    // 1️⃣ Find pending form
    const [rows] = await db.query(
      "SELECT * FROM user_forms WHERE id = ? AND status = 'PENDING'",
      [formId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Form not found or already processed" });
    }

    const form = rows[0];

    // 2️⃣ Update status → REJECTED
    await db.query(
      "UPDATE user_forms SET status = 'REJECTED' WHERE id = ?",
      [formId]
    );

    // 3️⃣ Send rejection mail
    sendRejectionMail(form.email, form.full_name, reason).catch(() => {});

    return res.json({
      success: true,
      message: "Form rejected & email sent",
    });

  } catch (err) {
    console.error("ADMIN REJECT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
