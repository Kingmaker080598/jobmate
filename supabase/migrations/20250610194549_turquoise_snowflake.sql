/*
  # Update job applications table for enhanced tracking

  1. Changes
    - Add more fields for comprehensive application tracking
    - Add status tracking
    - Add interview scheduling fields
    - Add notes and follow-up tracking

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to job_applications table
DO $$
BEGIN
  -- Add job_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'job_url'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN job_url text;
  END IF;

  -- Add salary column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'salary'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN salary text;
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'notes'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN notes text;
  END IF;

  -- Add interview_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'interview_date'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN interview_date timestamptz;
  END IF;

  -- Add follow_up_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'follow_up_date'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN follow_up_date timestamptz;
  END IF;

  -- Add priority column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'priority'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN priority text DEFAULT 'medium';
  END IF;

  -- Add contact_person column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN contact_person text;
  END IF;

  -- Add contact_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN contact_email text;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_applications' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE job_applications ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status ON job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at);