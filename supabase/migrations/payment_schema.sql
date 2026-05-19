-- Add payment columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS owner_payout_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id TEXT;

-- Platform settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO public.platform_settings (key, value)
VALUES ('commission_rate', '10')
ON CONFLICT (key) DO NOTHING;

-- Payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id),
  total_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  payout_amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- RLS on payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage payouts" ON public.payouts
  FOR ALL USING (is_admin());
CREATE POLICY "Owners can view own payouts" ON public.payouts
  FOR SELECT USING (owner_id = auth.uid());

-- RLS on platform_settings (admin only write, all read)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read platform settings" ON public.platform_settings
  FOR SELECT USING (true);
CREATE POLICY "Only admins can update platform settings" ON public.platform_settings
  FOR ALL USING (is_admin());

NOTIFY pgrst, 'reload schema';
