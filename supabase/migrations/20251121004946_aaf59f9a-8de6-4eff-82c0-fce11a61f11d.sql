-- Update educational_images table to accept arabic and english subjects
-- First, check if there's a constraint and remove it if exists
ALTER TABLE educational_images DROP CONSTRAINT IF EXISTS educational_images_subject_check;

-- Add a new check constraint that includes arabic and english
ALTER TABLE educational_images 
ADD CONSTRAINT educational_images_subject_check 
CHECK (subject IN ('physics', 'chemistry', 'biology', 'mathematics', 'arabic', 'english'));

-- Update scientific_journals table to accept arabic and english subjects
ALTER TABLE scientific_journals DROP CONSTRAINT IF EXISTS scientific_journals_subject_check;

-- Add a new check constraint that includes arabic and english
ALTER TABLE scientific_journals 
ADD CONSTRAINT scientific_journals_subject_check 
CHECK (subject IN ('physics', 'chemistry', 'biology', 'mathematics', 'arabic', 'english'));