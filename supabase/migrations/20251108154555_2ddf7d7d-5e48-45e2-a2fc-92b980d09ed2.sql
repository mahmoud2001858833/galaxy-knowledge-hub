-- Add unique constraint on email for admin_teacher_access if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'admin_teacher_access_email_key'
    ) THEN
        ALTER TABLE public.admin_teacher_access 
        ADD CONSTRAINT admin_teacher_access_email_key UNIQUE (email);
    END IF;
END $$;

-- Create index on email for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_admin_teacher_access_email 
ON public.admin_teacher_access(email);

-- Create index on user_id for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_admin_teacher_access_user_id 
ON public.admin_teacher_access(user_id);