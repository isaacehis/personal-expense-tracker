type PasswordResetEmail = {
  to: string;
  resetUrl: string;
};

export function isPasswordResetEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.PASSWORD_RESET_FROM);
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: PasswordResetEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM;

  if (!apiKey || !from) {
    throw new Error("Password-reset email is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your ExpenseTrack password",
      text: `Use this secure link to reset your ExpenseTrack password: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request it, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email service returned status ${response.status}.`);
  }
}
