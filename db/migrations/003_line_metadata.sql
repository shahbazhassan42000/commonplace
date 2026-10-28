-- Raise the per-line limit from 280 to 30000 characters.
ALTER TABLE lines
  DROP CONSTRAINT lines_body_length,
  ADD CONSTRAINT lines_body_length CHECK (char_length(body) BETWEEN 1 AND 30000);

-- Request metadata captured server-side when a line is posted, for admin
-- moderation only. Never shown in public feeds. Posters are told in the
-- composer that their IP, approximate location and browser are recorded.
ALTER TABLE lines
  ADD COLUMN ip              text,
  ADD COLUMN user_agent      text,
  ADD COLUMN accept_language text,
  ADD COLUMN referer         text,
  -- {city, countryRegion, country, latitude, longitude, timezone} from the
  -- Vercel proxy's IP geolocation headers.
  ADD COLUMN geo             jsonb;
