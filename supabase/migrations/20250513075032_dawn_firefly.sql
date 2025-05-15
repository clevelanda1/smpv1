-- Drop trigger first to remove dependency
DROP TRIGGER IF EXISTS track_story_creation ON saved_stories;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS increment_story_count();

CREATE OR REPLACE FUNCTION increment_story_count()
RETURNS TRIGGER AS $$
DECLARE
  current_usage RECORD;
  subscription_record RECORD;
  current_period_start timestamptz;
  current_period_end timestamptz;
  story_limit INTEGER := 15; -- Set story limit to 15
BEGIN
  -- Get user's subscription details
  SELECT 
    subscription_id,
    to_timestamp(current_period_start)::timestamptz as period_start,
    to_timestamp(current_period_end)::timestamptz as period_end
  INTO subscription_record
  FROM stripe_user_subscriptions
  WHERE customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = NEW.user_id
  );

  -- Set period dates
  IF subscription_record.period_start IS NOT NULL THEN
    current_period_start := subscription_record.period_start;
    current_period_end := subscription_record.period_end;
  ELSE
    current_period_start := date_trunc('month', CURRENT_TIMESTAMP);
    current_period_end := (date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month' - interval '1 second')::timestamptz;
  END IF;

  -- Get or create usage record for current period
  SELECT * INTO current_usage
  FROM story_usage
  WHERE user_id = NEW.user_id
    AND period_start <= CURRENT_TIMESTAMP
    AND period_end >= CURRENT_TIMESTAMP;

  -- Check if user has reached the story limit
  IF current_usage.stories_created >= story_limit THEN
    RAISE EXCEPTION 'Story limit of % reached for this period', story_limit;
  END IF;

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
      current_period_start,
      current_period_end
    );
  ELSE
    -- Update existing usage record
    UPDATE story_usage
    SET 
      stories_created = stories_created + 1,
      subscription_id = COALESCE(subscription_record.subscription_id, subscription_id),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = current_usage.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint to prevent duplicate periods
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'unique_user_period'
  ) THEN
    ALTER TABLE story_usage 
    ADD CONSTRAINT unique_user_period 
    UNIQUE (user_id, period_start, period_end);
  END IF;
END $$;

-- Recreate trigger to only count rated stories
CREATE TRIGGER track_story_creation
  AFTER INSERT ON saved_stories
  FOR EACH ROW
  WHEN (NEW.rating = true)
  EXECUTE FUNCTION increment_story_count();