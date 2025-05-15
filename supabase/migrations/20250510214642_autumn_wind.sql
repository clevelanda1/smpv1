/*
  # Add story tracking system

  1. New Tables
    - `story_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `subscription_id` (text)
      - `stories_created` (integer)
      - `period_start` (timestamptz)
      - `period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `story_usage` table
    - Add policies for authenticated users to view their usage
*/

CREATE TABLE IF NOT EXISTS story_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subscription_id text,
  stories_created integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

ALTER TABLE story_usage ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own usage data
CREATE POLICY "Users can read own usage data"
  ON story_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to increment story count
CREATE OR REPLACE FUNCTION increment_story_count()
RETURNS TRIGGER AS $$
DECLARE
  current_usage RECORD;
  subscription_record RECORD;
BEGIN
  -- Get user's subscription details
  SELECT * INTO subscription_record
  FROM stripe_user_subscriptions
  WHERE customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = NEW.user_id
  );

  -- Get or create usage record for current period
  SELECT * INTO current_usage
  FROM story_usage
  WHERE user_id = NEW.user_id
    AND period_start <= CURRENT_TIMESTAMP
    AND period_end >= CURRENT_TIMESTAMP;

  IF NOT FOUND THEN
    -- Create new usage record
    INSERT INTO story_usage (
      user_id,
      subscription_id,
      stories_created,
      period_start,
      period_end
    )
    VALUES (
      NEW.user_id,
      subscription_record.subscription_id,
      1,
      date_trunc('month', CURRENT_TIMESTAMP),
      (date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month' - interval '1 second')
    );
  ELSE
    -- Update existing usage record
    UPDATE story_usage
    SET stories_created = stories_created + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = current_usage.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track story creation
CREATE TRIGGER track_story_creation
  AFTER INSERT ON saved_stories
  FOR EACH ROW
  EXECUTE FUNCTION increment_story_count();

-- Create view for user story usage
CREATE OR REPLACE VIEW user_story_usage
WITH (security_invoker = true)
AS
SELECT 
  u.stories_created,
  u.period_start,
  u.period_end,
  CASE 
    WHEN s.price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' THEN 20 -- Starter plan
    ELSE -1 -- Unlimited plan
  END as monthly_limit,
  CASE 
    WHEN s.price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' THEN 
      GREATEST(0, 20 - u.stories_created)
    ELSE -1
  END as stories_remaining,
  EXTRACT(DAY FROM (u.period_end - CURRENT_TIMESTAMP)) as days_remaining
FROM story_usage u
LEFT JOIN stripe_user_subscriptions s ON s.subscription_id = u.subscription_id
WHERE u.user_id = auth.uid()
  AND u.period_start <= CURRENT_TIMESTAMP
  AND u.period_end >= CURRENT_TIMESTAMP;