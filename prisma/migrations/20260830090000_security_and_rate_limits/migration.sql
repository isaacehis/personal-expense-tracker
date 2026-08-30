-- A database-backed limiter works across all serverless instances.
CREATE TABLE "rate_limits" (
    "id" UUID NOT NULL,
    "key_hash" CHAR(64) NOT NULL,
    "action" VARCHAR(32) NOT NULL,
    "hit_count" INTEGER NOT NULL DEFAULT 1,
    "window_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blocked_until" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rate_limits_key_hash_action_key"
ON "rate_limits"("key_hash", "action");

CREATE INDEX "rate_limits_window_start_idx"
ON "rate_limits"("window_start");

ALTER TABLE "rate_limits"
ADD CONSTRAINT "rate_limits_hit_count_positive" CHECK ("hit_count" > 0);

-- Defence in depth for deployments that use a restricted PostgreSQL runtime role.
-- The server sets transaction-local app.* values before user-scoped queries.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_isolation" ON "users"
USING (
  "id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  OR "email" = NULLIF(current_setting('app.login_email', true), '')
  OR EXISTS (
    SELECT 1 FROM "sessions"
    WHERE "sessions"."user_id" = "users"."id"
      AND "sessions"."token_hash" = NULLIF(current_setting('app.current_session_hash', true), '')
  )
)
WITH CHECK (
  "id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  OR current_setting('app.registration_allowed', true) = 'true'
);

CREATE POLICY "categories_isolation" ON "categories"
USING ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
WITH CHECK ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

CREATE POLICY "transactions_isolation" ON "transactions"
USING ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
WITH CHECK ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

CREATE POLICY "budgets_isolation" ON "budgets"
USING ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid)
WITH CHECK ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

CREATE POLICY "sessions_isolation" ON "sessions"
USING (
  "user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  OR "token_hash" = NULLIF(current_setting('app.current_session_hash', true), '')
)
WITH CHECK ("user_id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid);

-- Rate-limit records contain one-way identifiers only and are server-maintained.
CREATE POLICY "rate_limits_server_access" ON "rate_limits"
USING (true) WITH CHECK (true);
