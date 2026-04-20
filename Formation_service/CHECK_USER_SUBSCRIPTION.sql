-- Check if user has existing subscriptions
-- Replace USER_ID with your actual user ID (probably 1 or 2)

-- Check all subscriptions for user
SELECT 
    us.id,
    us.user_id,
    sp.name as plan_name,
    us.status,
    us.start_date,
    us.end_date,
    us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = 1  -- Change this to your user ID
ORDER BY us.created_at DESC;

-- Check all payments for user
SELECT 
    id,
    user_id,
    subscription_id,
    amount,
    payment_status,
    transaction_id,
    paid_at,
    created_at
FROM subscription_payments
WHERE user_id = 1  -- Change this to your user ID
ORDER BY created_at DESC;

-- If you want to clean up and start fresh, run these:
-- (Uncomment to use)

-- Delete all payments for user
-- DELETE FROM subscription_payments WHERE user_id = 1;

-- Delete all subscriptions for user
-- DELETE FROM user_subscriptions WHERE user_id = 1;

-- Or just cancel/expire existing subscriptions:
-- UPDATE user_subscriptions 
-- SET status = 'EXPIRED', end_date = NOW() - INTERVAL 1 DAY
-- WHERE user_id = 1 AND status IN ('ACTIVE', 'PENDING');
