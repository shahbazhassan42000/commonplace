-- Failed admin sign-in attempts, keyed by hashed IP, for rate limiting the
-- /admin login. Rows are cleared on a successful sign-in and expire by age.
CREATE TABLE admin_login_attempts (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash      text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_login_attempts_ip_idx
  ON admin_login_attempts (ip_hash, attempted_at);
