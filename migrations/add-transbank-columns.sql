-- Migration: Add Transbank columns to orders table
-- Run this in your Supabase SQL editor

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS transbank_token TEXT,
ADD COLUMN IF NOT EXISTS transbank_buy_order TEXT,
ADD COLUMN IF NOT EXISTS transbank_session_id TEXT,
ADD COLUMN IF NOT EXISTS transbank_response_code INTEGER,
ADD COLUMN IF NOT EXISTS transbank_status TEXT,
ADD COLUMN IF NOT EXISTS transbank_authorization_code TEXT,
ADD COLUMN IF NOT EXISTS transbank_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_transbank_token ON orders(transbank_token);
CREATE INDEX IF NOT EXISTS idx_orders_transbank_buy_order ON orders(transbank_buy_order);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

