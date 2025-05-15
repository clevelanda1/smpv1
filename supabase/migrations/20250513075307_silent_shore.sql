-- Update the view to show correct limit and remaining stories
DROP VIEW IF EXISTS user_story_usage;

CREATE VIEW user_story_usage 
WITH (security_invoker = true)
AS
SELECT 
  u.stories_created,
  u.period_start,
  u.period_end,
  15 as monthly_limit, -- Set fixed limit of 15 stories
  GREATEST(0, 15 - COALESCE(u.stories_created, 0)) as stories_remaining,
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