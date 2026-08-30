import { z } from "zod";

import { moneyAmountSchema } from "@/lib/validation/transaction";

const yearSchema = z.coerce.number().int().min(2000).max(9999);
const monthSchema = z.coerce.number().int().min(1).max(12);

export const budgetSchema = z.object({
  categoryId: z.string().uuid("Select a valid expense category."),
  amount: moneyAmountSchema,
  month: monthSchema,
  year: yearSchema,
});

export const budgetQuerySchema = z.object({
  month: monthSchema,
  year: yearSchema,
});

export type BudgetInput = z.infer<typeof budgetSchema>;
