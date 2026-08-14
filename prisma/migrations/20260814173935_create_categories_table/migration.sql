-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "color" VARCHAR(7) NOT NULL DEFAULT '#64748B',
    "icon" VARCHAR(50) NOT NULL DEFAULT 'tag',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_name_type_key" ON "categories"("user_id", "name", "type");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
