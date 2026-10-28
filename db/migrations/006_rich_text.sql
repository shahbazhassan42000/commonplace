-- Rich text for line bodies.
--
-- `body` stays the plain-text form of the line: it drives search, the share
-- card, metadata and the length limit, and keeps older deployed code working.
-- Two new columns hold the formatting:
--   body_html    – the full sanitized HTML (shown on the line page and hero)
--   body_preview – a short sanitized HTML excerpt (shown in the grid cards)
-- The app writes all three. A trigger derives html/preview from the plain body
-- whenever they aren't supplied, so inserts/updates from code that predates
-- these columns (e.g. during a deploy) stay valid instead of failing NOT NULL.

ALTER TABLE lines ADD COLUMN body_html text;
ALTER TABLE lines ADD COLUMN body_preview text;

-- Escapes plain text to HTML (ampersand first) and turns newlines into <br>.
CREATE OR REPLACE FUNCTION line_plain_to_html(txt text) RETURNS text AS $$
  SELECT replace(
           replace(
             replace(
               replace(txt, '&', '&amp;'),
             '<', '&lt;'),
           '>', '&gt;'),
         E'\n', '<br>');
$$ LANGUAGE sql IMMUTABLE;

-- Fill html/preview from the plain body when the writer didn't set them.
CREATE OR REPLACE FUNCTION lines_fill_html() RETURNS trigger AS $$
BEGIN
  IF NEW.body_html IS NULL THEN
    NEW.body_html := line_plain_to_html(NEW.body);
  END IF;
  IF NEW.body_preview IS NULL THEN
    NEW.body_preview := line_plain_to_html(left(NEW.body, 1200));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lines_fill_html_trg
  BEFORE INSERT OR UPDATE ON lines
  FOR EACH ROW EXECUTE FUNCTION lines_fill_html();

-- Backfill existing rows (all plain text today) from their body.
UPDATE lines
SET body_html = line_plain_to_html(body),
    body_preview = line_plain_to_html(left(body, 1200))
WHERE body_html IS NULL;

ALTER TABLE lines ALTER COLUMN body_html SET NOT NULL;
ALTER TABLE lines ALTER COLUMN body_preview SET NOT NULL;

ALTER TABLE lines
  ADD CONSTRAINT lines_body_html_length CHECK (char_length(body_html) BETWEEN 1 AND 200000);
