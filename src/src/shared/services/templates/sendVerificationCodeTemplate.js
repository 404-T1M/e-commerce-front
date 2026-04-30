exports.sendVerificationCodeTemplate = (code) => {
  return `
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <h3>${code}</h3>
            <p>This code will expire in 10 minutes.</p>
          `;
};
