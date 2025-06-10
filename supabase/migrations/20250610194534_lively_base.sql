/*
  # Create saved jobs table

  1. New Tables
    - `saved_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `job_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_jobs` table
    - Add policy for users to manage their own saved jobs
*/

CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved jobs"
  ON saved_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON saved_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave jobs"
  ON saved_jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);