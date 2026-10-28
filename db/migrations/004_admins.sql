-- Admin accounts for the hidden /admin moderation page.
--
-- The first account is seeded lazily on the first successful sign-in from
-- ADMIN_EMAIL + ADMIN_INITIAL_PASSWORD (see src/app/admin/actions.ts). Until
-- the admin sets their own password, must_reset stays true and the only
-- accepted credential is the initial password from the environment; the first
-- sign-in forces a password reset.
CREATE TABLE admins (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         text NOT NULL,
  password_hash text,
  must_reset    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- One account per email, case-insensitively.
CREATE UNIQUE INDEX admins_email_lower_key ON admins (lower(email));
