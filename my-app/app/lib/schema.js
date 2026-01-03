import { RecurringInterval } from "@prisma/client";
import { z } from "zod";
export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is requried"),
  isDefault: z.boolean().default(false),
});
export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount is requried"),
    description: z.string().optional(),
    date: z.date({ requried_error: "Date is requried" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is requried"),
    isRecurring: z.boolean().default(false),
    RecurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.RecurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transaction",
        path: ["recurringInterval"],
      });
    }
  });
