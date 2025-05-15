/*
  # Add story feedback system

  1. New Tables
    - `story_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `story_id` (uuid, references saved_stories)
      - `story_title` (text)
      - `child_comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `story_feedback` table
    - Add policies for authenticated users to manage their feedback
*/

CREATE TABLE IF NOT EXISTS story_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  story_id uuid REFERENCES saved_stories NOT NULL,
  story_title text NOT NULL,
  child_comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE story_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own feedback
CREATE POLICY "Users can read own feedback"
  ON story_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON story_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_story_feedback_user_id ON story_feedback(user_id);
CREATE INDEX idx_story_feedback_story_id ON story_feedback(story_id);