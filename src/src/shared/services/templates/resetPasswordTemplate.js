exports.resetPasswordTemplate = (name, resetUrl) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Password Reset Request</h2>

    <p>Hello ${name?.split(" ")[0] || "User"},</p>

    <p>
      We received a request to reset the password for your account.
    </p>

    <p>
      Click the button below to reset your password:
    </p>

    <p style="margin: 30px 0;">
      <a
        href="${resetUrl}"
        style="
          background-color: #2563eb;
          color: #ffffff;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        "
      >
        Reset Password
      </a>
    </p>

    <p>
      This link will expire in <strong>10 minutes</strong>.
    </p>

    <p>
      If you did not request a password reset, please ignore this email.
      Your password will remain unchanged.
    </p>

    <hr style="margin: 30px 0;" />

    <p style="font-size: 12px; color: #777;">
      For security reasons, never share this link with anyone.
    </p>

    <p>
      — E-commerce Support Team
    </p>
  </div>
  `;
};
