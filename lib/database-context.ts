import type { Prisma } from "@/app/generated/prisma/client";

import prisma from "@/lib/prisma";

type TransactionClient = Prisma.TransactionClient;

export function withUserContext<T>(
  userId: string,
  work: (database: TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (database) => {
    await database.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
    return work(database);
  });
}

export function withLoginEmail<T>(
  email: string,
  work: (database: TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (database) => {
    await database.$executeRaw`SELECT set_config('app.login_email', ${email}, true)`;
    return work(database);
  });
}

export function withRegistrationContext<T>(
  work: (database: TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (database) => {
    await database.$executeRaw`SELECT set_config('app.registration_allowed', 'true', true)`;
    return work(database);
  });
}
