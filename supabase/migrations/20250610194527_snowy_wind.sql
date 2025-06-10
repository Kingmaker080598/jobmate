/*
  # Create jobs table for job listings

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `description` (text)
      - `salary_min` (integer)
      - `salary_max` (integer)
      - `job_type` (text)
      - `experience_level` (text)
      - `skills` (text array)
      - `requirements` (text array)
      - `benefits` (text array)
      - `external_url` (text)
      - `source` (text)
      - `company_rating` (decimal)
      - `applicant_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text,
  description text,
  salary_min integer,
  salary_max integer,
  salary_text text,
  job_type text DEFAULT 'Full-time',
  experience_level text DEFAULT 'Mid',
  skills text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  external_url text,
  source text DEFAULT 'manual',
  company_rating decimal(2,1),
  applicant_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by everyone"
  ON jobs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Jobs can be inserted by authenticated users"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Jobs can be updated by authenticated users"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (true);