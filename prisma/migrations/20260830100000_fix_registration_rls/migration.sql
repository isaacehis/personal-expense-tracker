-- Allow an INSERT ... RETURNING during the short registration transaction.
DROP POLICY "users_isolation" ON "users";

CREATE POLICY "users_isolation" ON "users"
USING (
  "id" = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  OR "email" = NULLIF(current_setting('app.login_email', true), '')
  OR current_setting('app.registration_allowed', true) = 'true'
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
