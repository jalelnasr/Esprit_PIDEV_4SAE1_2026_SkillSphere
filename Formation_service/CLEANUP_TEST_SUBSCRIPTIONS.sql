-- Cleanup Script for Testing Automatic Payment System
-- This script removes test subscriptions so you can test the payment flow again

-- OPTION 1: Clean up for specific user (RECOMMENDED for testing)
-- Replace 1 with your actual user ID

-- Delete payments for user
DELETE FROM subscription_payments WHERE user_id = 1;

-- Delete subscriptions for user
DELETE FROM user_subscriptions WHERE user_id = 1;

-- OPTION 2: Expire existing subscriptions instead of deleting (safer)
-- This keeps the history but allows new subscriptions

-- UPDATE user_subscriptions 
-- SET status = 'EXPIRED', 
--     end_date = NOW() - INTERVAL 1 DAY
-- WHERE user_id = 1 
--   AND status IN ('ACTIVE', 'PENDING');

-- OPTION 3: Clean up ALL test data (use with caution!)
-- Uncomment only if you want to reset everything

-- DELETE FROM subscription_payments;
-- DELETE FROM user_subscriptions;

-- Verify cleanup
SELECT 'Remaining subscriptions:' as info;
SELECT 
    us.id,
    us.user_id,
    sp.name as plan_name,
    us.status,
    us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY us.created_at DESC;

SELECT 'Remaining payments:' as info;
SELECT 
    id,
    user_id,
    amount,
    payment_status,
    created_at
FROM subscription_payments
ORDER BY created_at DESC;
