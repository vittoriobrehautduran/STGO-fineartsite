-- Create meta_events table to log Meta CAPI events
CREATE TABLE IF NOT EXISTS meta_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  meta_response JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meta_events_order_id ON meta_events(order_id);
CREATE INDEX IF NOT EXISTS idx_meta_events_event_id ON meta_events(event_id);

-- Enable RLS
ALTER TABLE meta_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage meta_events
CREATE POLICY "Service role can manage meta_events"
  ON meta_events
  FOR ALL
  USING (auth.role() = 'service_role');

