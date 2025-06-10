/*
  # Create auto-apply related tables

  1. New Tables
    - `auto_apply_settings`
      - User auto-apply preferences and settings
    - `auto_apply_campaigns`
      - Auto-apply campaigns with specific criteria
    - `auto_apply_applications`
      - Track auto-apply application attempts

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Auto-apply settings table
CREATE TABLE IF NOT EXISTS auto_apply_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  max_applications_per_day integer DEFAULT 10,
  criteria jsonb DEFAULT '{}',
  sources jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Auto-apply campaigns table
CREATE TABLE IF NOT EXISTS auto_apply_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'active',
  criteria jsonb DEFAULT '{}',
  applications_count integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-apply applications table
CREATE TABLE IF NOT EXISTS auto_apply_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES auto_apply_campaigns(id) ON DELETE SET NULL,
  job_title text,
  company text,
  location text,
  status text DEFAULT 'pending',
  error_message text,
  applied_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Auto-import settings table
CREATE TABLE IF NOT EXISTS auto_import_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  criteria jsonb DEFAULT '{}',
  sources jsonb DEFAULT '{}',
  last_import_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE auto_apply_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_apply_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_apply_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_import_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auto_apply_settings
CREATE POLICY "Users can view their own auto-apply settings"
  ON auto_apply_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own auto-apply settings"
  ON auto_apply_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for auto_apply_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON auto_apply_campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns"
  ON auto_apply_campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for auto_apply_applications
CREATE POLICY "Users can view their own auto-apply applications"
  ON auto_apply_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own auto-apply applications"
  ON auto_apply_applications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for auto_import_settings
CREATE POLICY "Users can view their own auto-import settings"
  ON auto_import_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own auto-import settings"
  ON auto_import_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);