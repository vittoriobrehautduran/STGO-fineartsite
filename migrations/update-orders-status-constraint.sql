-- Migration: Update orders status check constraint to allow pending_payment and payment_failed
-- Run this in your Supabase SQL editor

-- First, drop the existing constraint (you'll need to find its exact name)
-- Common names: orders_status_check, check_status, etc.
-- You can find it by running: 
-- SELECT conname FROM pg_constraint WHERE conrelid = 'orders'::regclass AND contype = 'c';

-- Drop the old constraint (replace 'orders_status_check' with the actual constraint name if different)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint that allows all status values we need
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'pending_payment', 'paid', 'payment_failed', 'processing', 'completed', 'cancelled'));

