/*
  # Add custom characters table

  1. New Tables
    - `custom_characters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `traits` (text[])
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `custom_characters` table
    - Add policies for authenticated users to manage their custom characters
*/

CREATE TABLE IF NOT EXISTS custom_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  traits text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE custom_characters ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own custom characters
CREATE POLICY "Users can read own custom characters"
  ON custom_characters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own custom characters
CREATE POLICY "Users can insert own custom characters"
  ON custom_characters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own custom characters
CREATE POLICY "Users can update own custom characters"
  ON custom_characters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own custom characters
CREATE POLICY "Users can delete own custom characters"
  ON custom_characters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);