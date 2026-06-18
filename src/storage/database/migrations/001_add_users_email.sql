-- Add email column for registration and daily love letter cron
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
