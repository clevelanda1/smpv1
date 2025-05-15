/*
  # Fix Story Usage RLS Policies

  1. Changes
    - Add INSERT policy for story_usage table
    - Add UPDATE policy for story_usage table
    - Ensure authenticated users can manage their usage data
*/

-- Add INSERT policy for story_usage
CREATE POLICY "Users can insert own usage data"
  ON story_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for story_usage
CREATE POLICY "Users can update own usage data"
  ON story_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);