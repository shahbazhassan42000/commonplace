-- Categories are created on the fly when someone posts a line with a new one.
CREATE TABLE categories (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_length CHECK (char_length(name) BETWEEN 1 AND 32)
);

-- Case-insensitive uniqueness: "Poetry", "poetry" and "POETRY" are one category.
CREATE UNIQUE INDEX categories_name_lower_key ON categories (lower(name));

CREATE TABLE lines (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  body        text NOT NULL,
  category_id bigint NOT NULL REFERENCES categories (id),
  -- Keyed hash of the poster's IP, used only for rate limiting. Never displayed.
  author_hash text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lines_body_length CHECK (char_length(body) BETWEEN 1 AND 280)
);

-- Feeds page newest-first by id (the primary key covers the unfiltered feed).
CREATE INDEX lines_category_id_idx ON lines (category_id, id DESC);
CREATE INDEX lines_author_hash_idx ON lines (author_hash, created_at) WHERE author_hash IS NOT NULL;
