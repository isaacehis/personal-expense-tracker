-- CreateTable
CREATE TABLE "budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "month" SMALLINT NOT NULL,
    "year" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_user_id_year_month_idx" ON "budgets"("user_id", "year", "month");

-- CreateIndex
CREATE INDEX "budgets_category_id_idx" ON "budgets"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_category_id_year_month_key" ON "budgets"("user_id", "category_id", "year", "month");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Ensure that every budget has a positive amount
ALTER TABLE "budgets"
ADD CONSTRAINT "budgets_amount_positive"
CHECK ("amount" > 0);

-- Ensure that the month is between January and December
ALTER TABLE "budgets"
ADD CONSTRAINT "budgets_month_valid"
CHECK ("month" BETWEEN 1 AND 12);

-- Ensure that the year is within a valid four-digit range
ALTER TABLE "budgets"
ADD CONSTRAINT "budgets_year_valid"
CHECK ("year" BETWEEN 2000 AND 9999);
