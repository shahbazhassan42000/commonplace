-- Optional attribution for a line: an author, a book, or "Written by me".
ALTER TABLE lines
  ADD COLUMN source text,
  ADD CONSTRAINT lines_source_length CHECK (source IS NULL OR char_length(source) BETWEEN 1 AND 100);
