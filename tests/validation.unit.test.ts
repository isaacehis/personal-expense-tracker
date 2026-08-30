import assert from "node:assert/strict";
import test from "node:test";

import { changePasswordSchema, profileSchema, registerSchema } from "../lib/validation/auth";
import { budgetSchema } from "../lib/validation/budget";
import { createTransactionSchema, transactionQuerySchema } from "../lib/validation/transaction";

test("registration normalizes email and rejects weak credentials", () => {
  const valid = registerSchema.parse({ name: "Ada Student", email: " ADA@EXAMPLE.COM ", password: "CorrectHorse123!", confirmPassword: "CorrectHorse123!" });
  assert.equal(valid.email, "ada@example.com");
  assert.equal(registerSchema.safeParse({ name: "A", email: "bad", password: "short", confirmPassword: "other" }).success, false);
});

test("transaction validation accepts money precision and real dates", () => {
  assert.equal(createTransactionSchema.safeParse({ type: "EXPENSE", amount: "1250.50", description: "Books", note: "", categoryId: "4a1e9ec4-3128-4a7d-8a95-b804eed5705d", transactionDate: "2026-08-30" }).success, true);
  assert.equal(createTransactionSchema.safeParse({ type: "EXPENSE", amount: "1.999", description: "Books", categoryId: "bad", transactionDate: "2026-02-30" }).success, false);
});

test("filter and budget validation enforce calendar ranges", () => {
  assert.equal(transactionQuerySchema.safeParse({ month: "2026-13" }).success, false);
  assert.equal(budgetSchema.safeParse({ categoryId: "4a1e9ec4-3128-4a7d-8a95-b804eed5705d", amount: "50000", month: 8, year: 2026 }).success, true);
  assert.equal(budgetSchema.safeParse({ categoryId: "4a1e9ec4-3128-4a7d-8a95-b804eed5705d", amount: "0", month: 0, year: 1999 }).success, false);
});

test("profile and password settings reject invalid changes", () => {
  assert.equal(profileSchema.safeParse({ name: "Ada Student", email: "ada@example.com", currency: "NGN", timezone: "Africa/Lagos" }).success, true);
  assert.equal(profileSchema.safeParse({ name: "A", email: "bad", currency: "BTC", timezone: "Mars/Base" }).success, false);
  assert.equal(changePasswordSchema.safeParse({ currentPassword: "OldPassword123!", newPassword: "NewPassword123!", confirmPassword: "different" }).success, false);
});
