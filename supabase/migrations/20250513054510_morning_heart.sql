/*
  # Update story feedback system

  1. Changes
    - Make story_id nullable in story_feedback table
    - Add index on user_id and created_at for better performance

  2. Security
    - No changes to existing policies needed
*/

-- Make story_id nullable for last generated story feedback
ALTER TABLE story_feedback 
  ALTER COLUMN story_id DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_story_feedback_user_created 
  ON story_feedback(user_id, created_at DESC);