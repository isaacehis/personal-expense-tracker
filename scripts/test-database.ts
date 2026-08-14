import "dotenv/config";
import prisma from "../lib/prisma";

async function testDatabase() {
  const [users, categories, transactions, budgets, sessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.transaction.count(),
      prisma.budget.count(),
      prisma.session.count(),
    ]);

  console.log("Database connection successful.");

  console.table({
    users,
    categories,
    transactions,
    budgets,
    sessions,
  });
}

testDatabase()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });