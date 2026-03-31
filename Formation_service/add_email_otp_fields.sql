-- Add Email OTP fields to subscription_payments table

ALTER TABLE subscription_payments
ADD COLUMN customer_email VARCHAR(255) AFTER paid_at,
ADD COLUMN masked_card VARCHAR(20) AFTER customer_email,
ADD COLUMN card_brand VARCHAR(50) AFTER masked_card,
ADD COLUMN otp_sent_at DATETIME AFTER card_brand;

-- Verify changes
DESCRIBE subscription_payments;

-- Optional: Update existing records with placeholder values
-- UPDATE subscription_payments 
-- SET customer_email = 'legacy@example.com',
--     masked_card = '**** **** **** 0000',
--     card_brand = 'LEGACY'
-- WHERE customer_email IS NULL;
