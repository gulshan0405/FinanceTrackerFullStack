"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/* ---------- SERIALIZER ---------- */
const serialize = (obj) => ({
  ...obj,
  amount: obj.amount ? obj.amount.toNumber() : undefined,
  balance: obj.balance ? obj.balance.toNumber() : undefined,
  createdAt: obj.createdAt?.toISOString(),
  updatedAt: obj.updatedAt?.toISOString(),
  date: obj.date?.toISOString(),
  nextRecurringDate: obj.nextRecurringDate?.toISOString(),
  lastProcessed: obj.lastProcessed?.toISOString(),
});

/* ---------- CREATE ACCOUNT ---------- */
export async function createAccount(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const balance = parseFloat(data.balance);
  if (isNaN(balance)) throw new Error("Invalid balance");

  const existingAccounts = await db.account.findMany({
    where: { userId: user.id },
  });

  const shouldBeDefault =
    existingAccounts.length === 0 ? true : data.isDefault;

  if (shouldBeDefault) {
    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const account = await db.account.create({
    data: {
      ...data,
      balance,
      userId: user.id,
      isDefault: shouldBeDefault,
    },
  });

  revalidatePath("/dashboard");
  return serialize(account);
}

/* ---------- GET ACCOUNTS ---------- */
export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });

  return accounts.map(serialize);
}

/* ---------- DASHBOARD DATA ---------- */
export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serialize);
}
