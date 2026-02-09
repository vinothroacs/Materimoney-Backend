exports.acceptTemplate = (name) => `
  <h2>Welcome to Kalyanamalai 💍</h2>
  <p>Hi <b>${name}</b>,</p>
  <p>Your profile has been approved by our admin.</p>
  <p>You can now start exploring matches.</p>
  <br/>
  <p>– Team Kalyanamalai</p>
`;

exports.rejectTemplate = (name, reason = "") => `
  <h2>Profile Update – Kalyanamalai</h2>
  <p>Hi <b>${name}</b>,</p>
  <p>We regret to inform you that your profile was rejected.</p>
  ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}
  <br/>
  <p>– Team Kalyanamalai</p>
`;
