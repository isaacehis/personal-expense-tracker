import { z } from "zod";

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

function isValidDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const amountSchema = z.preprocess(
  (value) => {
    if (typeof value === "number") {
      return value.toString();
    }

    return value;
  },
  z
    .string()
    .trim()
    .min(1, "Amount is required.")
    .regex(
      /^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/,
      "Amount must be a valid number with at most two decimal places.",
    )
    .refine((value) => Number(value) > 0, {
      message: "Amount must be greater than zero.",
    }),
);

const transactionDateSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Transaction date must use the YYYY-MM-DD format.",
  )
  .refine(isValidDateString, {
    message: "Transaction date is invalid.",
  });

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,

  amount: amountSchema,

  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(150, "Description must not exceed 150 characters."),

  note: z
    .string()
    .trim()
    .max(500, "Note must not exceed 500 characters.")
    .optional()
    .default(""),

  categoryId: z
    .string()
    .uuid("Please select a valid transaction category."),

  transactionDate: transactionDateSchema,
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>;