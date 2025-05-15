/*
  # Add custom options table

  1. New Tables
    - `user_custom_options`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `option_type` (text) - Type of option (developmental_needs, sleep_concerns, story_themes)
      - `value` (text) - The custom option value
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_custom_options` table
    - Add policies for authenticated users to manage their custom options
*/

CREATE TABLE IF NOT EXISTS user_custom_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  option_type text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  UNIQUE (user_id, option_type, value)
);

ALTER TABLE user_custom_options ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own custom options
CREATE POLICY "Users can read own custom options"
  ON user_custom_options
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own custom options
CREATE POLICY "Users can insert own custom options"
  ON user_custom_options
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own custom options
CREATE POLICY "Users can delete own custom options"
  ON user_custom_options
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);