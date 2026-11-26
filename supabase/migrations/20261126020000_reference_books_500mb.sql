-- The app-level 500MB limit (raised from 100MB) was never matched here, so uploads over 100MB
-- still failed the table's own check constraint. Bring the constraint in line with the app.
alter table reference_books drop constraint reference_books_size_bytes_check;
alter table reference_books add constraint reference_books_size_bytes_check
  check (size_bytes > 0 and size_bytes <= 524288000);
