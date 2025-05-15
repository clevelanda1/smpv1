/*
  # Add saved stories system

  1. New Tables
    - `saved_stories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `story_content` (text)
      - `story_input` (jsonb)
      - `created_at` (timestamptz)
      - `rating` (boolean)

  2. Security
    - Enable RLS on `saved_stories` table
    - Add policies for authenticated users to manage their saved stories
*/

CREATE TABLE IF NOT EXISTS saved_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  story_content text NOT NULL,
  story_input jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  rating boolean NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own saved stories
CREATE POLICY "Users can read own saved stories"
  ON saved_stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own saved stories
CREATE POLICY "Users can insert own saved stories"
  ON saved_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own saved stories
CREATE POLICY "Users can delete own saved stories"
  ON saved_stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);