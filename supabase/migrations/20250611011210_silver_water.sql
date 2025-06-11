/*
  # Create scraping_history table

  1. New Tables
    - `scraping_history` - Store web scraping results and job data

  2. Security
    - Enable RLS on scraping_history table
    - Add policies for users to manage their own scraping data
*/

-- Create scraping_history table
CREATE TABLE IF NOT EXISTS scraping_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  job_title text,
  company text,
  scraped_data jsonb DEFAULT '{}',
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scraping_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scraping_history
CREATE POLICY "Users can view their own scraping history"
  ON scraping_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraping history"
  ON scraping_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_scraping_history_user_id ON scraping_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_history_created_at ON scraping_history(created_at);