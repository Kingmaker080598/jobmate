/*
  # Create additional tables for JobMate features

  1. New Tables
    - `autofill_history` - Track autofill attempts and success rates
    - `scraping_history` - Store web scraping results and job data
    - `ai_interactions` - Log AI tailoring sessions and results
    - `user_preferences` - Store user settings and preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Autofill history table
CREATE TABLE IF NOT EXISTS autofill_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text,
  fields_filled integer DEFAULT 0,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Scraping history table
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

-- AI interactions table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'resume_tailoring', 'job_analysis', etc.
  input_data jsonb DEFAULT '{}',
  output_data jsonb DEFAULT '{}',
  match_score integer,
  keywords_used text[] DEFAULT '{}',
  tone_style text DEFAULT 'professional',
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  autofill_enabled boolean DEFAULT true,
  preferred_tone text DEFAULT 'professional',
  auto_save_jobs boolean DEFAULT true,
  notification_settings jsonb DEFAULT '{}',
  privacy_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Update resume_history table to include additional fields
DO $$
BEGIN
  -- Add match_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resume_history' AND column_name = 'match_score'
  ) THEN
    ALTER TABLE resume_history ADD COLUMN match_score integer;
  END IF;

  -- Add keywords_used column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resume_history' AND column_name = 'keywords_used'
  ) THEN
    ALTER TABLE resume_history ADD COLUMN keywords_used text[] DEFAULT '{}';
  END IF;

  -- Add tailored column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resume_history' AND column_name = 'tailored'
  ) THEN
    ALTER TABLE resume_history ADD COLUMN tailored boolean DEFAULT false;
  END IF;

  -- Add content column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resume_history' AND column_name = 'content'
  ) THEN
    ALTER TABLE resume_history ADD COLUMN content text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE autofill_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for autofill_history
CREATE POLICY "Users can view their own autofill history"
  ON autofill_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own autofill history"
  ON autofill_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- RLS Policies for ai_interactions
CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interactions"
  ON ai_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_autofill_history_user_id ON autofill_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_history_user_id ON scraping_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);