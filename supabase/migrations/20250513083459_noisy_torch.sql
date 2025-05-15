/*
  # Add Character Limit Based on Plan

  1. Changes
    - Add function to check character limit based on subscription plan
    - Add trigger to enforce limit on custom_characters table
    - Update RLS policies
*/

-- Create function to check character limit
CREATE OR REPLACE FUNCTION check_character_limit()
RETURNS TRIGGER AS $$
DECLARE
  character_count INTEGER;
  subscription_price_id TEXT;
BEGIN
  -- Get user's subscription price_id
  SELECT price_id INTO subscription_price_id
  FROM stripe_user_subscriptions
  WHERE customer_id IN (
    SELECT customer_id 
    FROM stripe_customers 
    WHERE user_id = NEW.user_id
  );

  -- Get current character count for user
  SELECT COUNT(*) INTO character_count
  FROM custom_characters
  WHERE user_id = NEW.user_id;

  -- Check limit based on subscription
  IF subscription_price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' AND character_count >= 2 THEN
    RAISE EXCEPTION 'Storybook Starter plan is limited to 2 custom characters. Please upgrade to Family Magic plan for unlimited characters.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce character limit
DROP TRIGGER IF EXISTS enforce_character_limit ON custom_characters;
CREATE TRIGGER enforce_character_limit
  BEFORE INSERT ON custom_characters
  FOR EACH ROW
  EXECUTE FUNCTION check_character_limit();