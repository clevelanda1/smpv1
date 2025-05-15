/*
  # Update Story Usage View

  1. Changes
    - Modify user_story_usage view to use subscription period
    - Calculate days remaining based on subscription end date
    - Handle both subscription types correctly

  2. Updates
    - More accurate days remaining calculation
    - Better handling of subscription periods
*/

DROP VIEW IF EXISTS user_story_usage;

CREATE VIEW user_story_usage 
WITH (security_invoker = true)
AS
SELECT 
  u.stories_created,
  u.period_start,
  u.period_end,
  CASE 
    WHEN s.price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' THEN 20 -- Starter plan
    ELSE NULL -- Other plans have no limit
  END as monthly_limit,
  CASE 
    WHEN s.price_id = 'price_1RMjaQPLXvC55IxstFbeHc3I' THEN 
      GREATEST(0, 20 - COALESCE(u.stories_created, 0))
    ELSE NULL -- Other plans have no limit
  END as stories_remaining,
  CASE
    WHEN s.current_period_end IS NOT NULL THEN
      EXTRACT(DAY FROM 
        (to_timestamp(s.current_period_end)::timestamptz - CURRENT_TIMESTAMP)
      )::numeric
    ELSE
      EXTRACT(DAY FROM (u.period_end - CURRENT_TIMESTAMP))::numeric
  END as days_remaining
FROM story_usage u
LEFT JOIN stripe_user_subscriptions s ON s.subscription_id = u.subscription_id
WHERE u.user_id = auth.uid()
  AND CURRENT_TIMESTAMP BETWEEN u.period_start AND u.period_end;