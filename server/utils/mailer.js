const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP verification email
 * @param {string} to      - recipient email
 * @param {string} code    - plain 6-digit OTP code
 * @param {string} name    - recipient name for personalisation
 */
async function sendOTP({ to, code, name }) {
  try {
    await resend.emails.send({
      from: 'Verse <onboarding@resend.dev>', // resend shared domain for pilot
      to,
      subject: 'Your Verse verification code',
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; color: #F0F0F0; border-radius: 16px; padding: 40px;">
          <div style="margin-bottom: 32px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #F0F0F0;">VERSE</span>
          </div>
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #F0F0F0;">
            Hey ${name}, verify your email
          </h2>
          <p style="color: #666; font-size: 15px; margin-bottom: 32px; line-height: 1.6;">
            Enter this code in the app to complete your registration. 
            It expires in 10 minutes.
          </p>
          <div style="background: #141414; border: 1px solid #242424; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #CAFF00;">
              ${code}
            </span>
          </div>
          <p style="color: #333; font-size: 12px; text-align: center; line-height: 1.6;">
            If you didn't create a Verse account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`OTP email sent to ${to}`);
  } catch (err) {
    console.error('Resend email error:', err);
    throw new Error('Failed to send OTP email');
  }
}

module.exports = { sendOTP };