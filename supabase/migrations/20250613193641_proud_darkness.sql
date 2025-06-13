/*
  # Create application_profile table for comprehensive autofill data

  1. New Tables
    - `application_profile` - Store comprehensive user profile data for autofill

  2. Security
    - Enable RLS on application_profile table
    - Add policies for users to manage their own profile data
*/

-- Create application_profile table with comprehensive fields
CREATE TABLE IF NOT EXISTS application_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  first_name text,
  last_name text,
  email text,
  phone text,
  location text,
  
  -- Professional Information
  linkedin_url text,
  portfolio_url text,
  github_url text,
  years_of_experience text,
  education text,
  expected_salary text,
  cover_letter_template text,
  skills text,
  certifications text,
  languages text,
  
  -- Work Authorization & Legal
  work_auth_status text,
  needs_sponsorship boolean DEFAULT false,
  veteran_status text,
  disability_status text,
  
  -- Personal Information (Optional)
  pronouns text,
  gender text,
  race_ethnicity text,
  
  -- Work Preferences
  willing_to_relocate boolean DEFAULT false,
  prefers_remote boolean DEFAULT false,
  availability_date text,
  notice_period text,
  preferred_work_schedule text,
  travel_willingness text,
  
  -- Additional Information
  security_clearance text,
  driver_license boolean DEFAULT false,
  background_check_consent boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE application_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own application profile"
  ON application_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application profile"
  ON application_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application profile"
  ON application_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own application profile"
  ON application_profile
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_application_profile_user_id ON application_profile(user_id);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_application_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_application_profile_updated_at
  BEFORE UPDATE ON application_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_application_profile_updated_at();