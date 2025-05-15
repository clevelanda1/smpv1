/*
  # Add story templates

  1. New Tables
    - `story_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `child_name` (text)
      - `developmental_stage` (text)
      - `language` (text)
      - `developmental_needs` (text[])
      - `reading_guidance` (text)
      - `sleep_concerns` (text[])
      - `story_theme` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `story_templates` table
    - Add policies for authenticated users to manage their templates
*/

CREATE TABLE IF NOT EXISTS story_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  child_name text,
  developmental_stage text,
  language text,
  developmental_needs text[],
  reading_guidance text,
  sleep_concerns text[],
  story_theme text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own templates
CREATE POLICY "Users can read own templates"
  ON story_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own templates
CREATE POLICY "Users can insert own templates"
  ON story_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own templates
CREATE POLICY "Users can update own templates"
  ON story_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own templates
CREATE POLICY "Users can delete own templates"
  ON story_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);