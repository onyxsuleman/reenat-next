-- Migration: Create webhook_raw_logs table for capturing raw Fastrr order webhook payloads
CREATE TABLE IF NOT EXISTS public.webhook_raw_logs (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_raw_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role and API writes/reads
DROP POLICY IF EXISTS "Allow all operations for webhook_raw_logs" ON public.webhook_raw_logs;
CREATE POLICY "Allow all operations for webhook_raw_logs" ON public.webhook_raw_logs FOR ALL USING (true) WITH CHECK (true);
