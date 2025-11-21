-- Migration: Add Transbank display columns to orders table
-- These columns store information needed to display transaction details per Transbank requirements

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS transbank_card_number TEXT, -- Last 4 digits of card
ADD COLUMN IF NOT EXISTS transbank_installments INTEGER, -- Number of installments
ADD COLUMN IF NOT EXISTS transbank_payment_type TEXT; -- VD (débito), VP (prepago), VN (crédito)

