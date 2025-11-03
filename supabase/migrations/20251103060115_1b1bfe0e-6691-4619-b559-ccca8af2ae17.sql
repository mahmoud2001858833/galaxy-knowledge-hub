-- Add project_link and project_images to btec_student_projects
ALTER TABLE btec_student_projects
ADD COLUMN project_link TEXT,
ADD COLUMN project_images TEXT[] DEFAULT '{}';

-- Add score field to btec_custom_platforms for rendered output
ALTER TABLE btec_custom_platforms
ADD COLUMN is_rendered BOOLEAN DEFAULT false;