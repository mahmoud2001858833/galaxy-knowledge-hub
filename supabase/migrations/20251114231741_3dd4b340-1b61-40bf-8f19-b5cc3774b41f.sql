-- Add teacher_name column to tawjihi_files table
ALTER TABLE tawjihi_files
ADD COLUMN teacher_name TEXT;

-- Add comment to the column
COMMENT ON COLUMN tawjihi_files.teacher_name IS 'Name of the teacher who uploaded the file';