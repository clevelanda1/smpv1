/*
  # Story Usage Tracking System

  1. New Tables
    - `story_usage`
      - Tracks monthly story creation per user
      - Links to subscription data
      - Stores period start/end dates
      - Maintains story count

  2. Views
    - `user_story_usage`
      - Shows current usage statistics
      - Calculates remaining stories
      - Displays days until reset

  3. Functions
    - `increment_story_count`
      - Automatically tracks story creation
      - Handles period transitions
      - Updates usage counters
*/

-- Drop existing objects to ensure clean slate
DROP TRIGGER IF EXISTS track_story_creation ON saved_stories;
DROP FUNCTION IF EXISTS increment_story_count();
DROP VIEW IF EXISTS user_story_usage;
DROP POLICY IF EXISTS "Users can read own usage data" ON story_usage;
DROP TABLE IF EXISTS story_usage;

-- Create story_usage table
CREATE TABLE story_usage (
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

-- Enable RLS
ALTER TABLE story_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own usage data
CREATE POLICY "Users can read own usage data"
  ON story_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create view for user story usage with subscription info
CREATE VIEW user_story_usage 
WITH (security_invoker = true)
AS
SELECT 
  u.stories_created,
  u.period_start,
  u.period_end,
  CASE 
    WHEN s.price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' THEN 20
    ELSE NULL
  END as monthly_limit,
  CASE 
    WHEN s.price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' THEN 20 - COALESCE(u.stories_created, 0)
    ELSE NULL
  END as stories_remaining,
  EXTRACT(DAY FROM (u.period_end - CURRENT_TIMESTAMP)) as days_remaining
FROM story_usage u
LEFT JOIN stripe_user_subscriptions s ON s.subscription_id = u.subscription_id
WHERE u.user_id = auth.uid()
AND CURRENT_TIMESTAMP BETWEEN u.period_start AND u.period_end;

-- Create function to increment story count
CREATE FUNCTION increment_story_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the current subscription period
  WITH current_period AS (
    SELECT 
      customer_id,
      subscription_id,
      CASE 
        WHEN current_period_start IS NOT NULL THEN 
          to_timestamp(current_period_start)::timestamptz
        ELSE 
          date_trunc('month', CURRENT_TIMESTAMP)
      END as period_start,
      CASE 
        WHEN current_period_end IS NOT NULL THEN 
          to_timestamp(current_period_end)::timestamptz
        ELSE 
          (date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month')
      END as period_end
    FROM stripe_subscriptions
    WHERE customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = NEW.user_id
    )
    AND status = 'active'
  )
  INSERT INTO story_usage (
    user_id,
    subscription_id,
    stories_created,
    period_start,
    period_end
  )
  SELECT 
    NEW.user_id,
    cp.subscription_id,
    1,
    cp.period_start,
    cp.period_end
  FROM current_period cp
  ON CONFLICT (user_id, period_start, period_end) 
  DO UPDATE SET 
    stories_created = story_usage.stories_created + 1,
    updated_at = CURRENT_TIMESTAMP;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track story creation
CREATE TRIGGER track_story_creation
  AFTER INSERT ON saved_stories
  FOR EACH ROW
  EXECUTE FUNCTION increment_story_count();