-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Ensure that the stored token is a valid lowercase SHA-256 hexadecimal hash
ALTER TABLE "sessions"
ADD CONSTRAINT "sessions_token_hash_valid"
CHECK ("token_hash" ~ '^[0-9a-f]{64}$');

-- Ensure that a session expires after it was created
ALTER TABLE "sessions"
ADD CONSTRAINT "sessions_expiry_after_creation"
CHECK ("expires_at" > "created_at");

-- If revoked, ensure that revocation occurred after session creation
ALTER TABLE "sessions"
ADD CONSTRAINT "sessions_revocation_after_creation"
CHECK ("revoked_at" IS NULL OR "revoked_at" >= "created_at");
