-- Migration: Add special_requests column to orders table
-- Run this in your Supabase SQL editor

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS special_requests TEXT;

