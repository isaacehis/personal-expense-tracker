import assert from "node:assert/strict";
import test from "node:test";

import {
  createPasswordResetToken,
  readPasswordResetToken,
  verifyPasswordResetToken,
} from "../lib/auth/password-reset";

test("password reset tokens reject tampering and old password hashes", () => {
  const token = createPasswordResetToken("7df73116-1669-4f2e-bfb8-e4265208cc88", "current-password-hash");
  const parsed = readPasswordResetToken(token);

  assert.ok(parsed);
  assert.equal(
    verifyPasswordResetToken(parsed.encodedPayload, parsed.signature, "current-password-hash"),
    true,
  );
  assert.equal(
    verifyPasswordResetToken(parsed.encodedPayload, parsed.signature, "changed-password-hash"),
    false,
  );
  assert.equal(readPasswordResetToken(`${token}tampered`), null);
});
