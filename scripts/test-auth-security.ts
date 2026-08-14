import { hashPassword, verifyPassword } from "../lib/auth/password";
import { registerSchema } from "../lib/validation/auth";

async function testAuthSecurity() {
  const plainPassword = "SecurePassword123!";

  const validRegistration = registerSchema.safeParse({
    name: "Test Student",
    email: "  STUDENT@EXAMPLE.COM  ",
    password: plainPassword,
    confirmPassword: plainPassword,
  });

  const invalidRegistration = registerSchema.safeParse({
    name: "T",
    email: "invalid-email",
    password: "short",
    confirmPassword: "different",
  });

  if (!validRegistration.success) {
    throw new Error("A valid registration was rejected.");
  }

  if (invalidRegistration.success) {
    throw new Error("An invalid registration was accepted.");
  }

  if (validRegistration.data.email !== "student@example.com") {
    throw new Error("Email normalization failed.");
  }

  const passwordHash = await hashPassword(plainPassword);

  const correctPasswordMatches = await verifyPassword(
    passwordHash,
    plainPassword,
  );

  const wrongPasswordMatches = await verifyPassword(
    passwordHash,
    "WrongPassword123!",
  );

  if (!correctPasswordMatches) {
    throw new Error("The correct password was rejected.");
  }

  if (wrongPasswordMatches) {
    throw new Error("The incorrect password was accepted.");
  }

  console.log("Authentication security test successful.");
  console.table({
    validRegistrationAccepted: validRegistration.success,
    invalidRegistrationRejected: !invalidRegistration.success,
    emailNormalized: validRegistration.data.email,
    passwordStoredAsHash: passwordHash !== plainPassword,
    correctPasswordAccepted: correctPasswordMatches,
    wrongPasswordRejected: !wrongPasswordMatches,
  });
}

testAuthSecurity().catch((error) => {
  console.error("Authentication security test failed:", error);
  process.exitCode = 1;
});