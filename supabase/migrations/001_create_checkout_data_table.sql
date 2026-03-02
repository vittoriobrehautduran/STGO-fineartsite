-- Create checkout_data table to store Meta Pixel data before redirect
CREATE TABLE IF NOT EXISTS checkout_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  fbp TEXT,
  fbc TEXT,
  email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  client_ip_address TEXT,
  client_user_agent TEXT,
  event_source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_checkout_data_order_id ON checkout_data(order_id);

-- Enable RLS
ALTER TABLE checkout_data ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert/select
CREATE POLICY "Service role can manage checkout_data"
  ON checkout_data
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Allow authenticated users to insert their own checkout data
CREATE POLICY "Users can insert their own checkout_data"
  ON checkout_data
  FOR INSERT
  WITH CHECK (true);

