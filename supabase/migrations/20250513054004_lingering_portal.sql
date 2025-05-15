/*
  # Add missing policies for story usage

  1. Changes
    - Add INSERT policy for users to create their own usage data
    - Add UPDATE policy for users to modify their own usage data
    - Include existence checks to prevent duplicate policy errors
*/

DO $$ 
BEGIN
  -- Check and create INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'story_usage' 
    AND policyname = 'Users can insert own usage data'
  ) THEN
    CREATE POLICY "Users can insert own usage data"
      ON story_usage
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check and create UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'story_usage' 
    AND policyname = 'Users can update own usage data'
  ) THEN
    CREATE POLICY "Users can update own usage data"
      ON story_usage
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;