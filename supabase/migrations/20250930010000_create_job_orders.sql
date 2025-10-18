/*
  Create tables for Job Orders and Job Order Files
  Notes:
  - This migration is designed for the current demo app which does not yet use Supabase Auth.
  - RLS is left DISABLED initially. Enable and add policies once you wire authentication.
*/

-- Create type-like checks using CHECK constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'delivery_type_enum'
  ) THEN
    CREATE TYPE delivery_type_enum AS ENUM ('pickup', 'delivery');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'order_status_enum'
  ) THEN
    CREATE TYPE order_status_enum AS ENUM ('pending', 'in_progress', 'ready', 'completed');
  END IF;
END
$$;

-- Job Orders table
CREATE TABLE IF NOT EXISTS public.job_orders (
  id BIGSERIAL PRIMARY KEY,
  job_order_number TEXT NOT NULL UNIQUE,
  -- Reference to vip_accounts; keep both uuid and unique_id string for flexibility
  vip_member_uuid UUID REFERENCES public.vip_accounts(id) ON DELETE SET NULL,
  vip_member_unique_id TEXT,

  delivery_type delivery_type_enum NOT NULL DEFAULT 'pickup',
  pickup_schedule TIMESTAMPTZ,
  receiver_name TEXT,
  receiver_address TEXT,
  receiver_mobile TEXT,

  paper_sizes TEXT[] NOT NULL DEFAULT '{}',
  number_of_copies INTEGER NOT NULL DEFAULT 1 CHECK (number_of_copies > 0),
  instructions TEXT,
  total_amount_to_pay NUMERIC(12,2),
  status order_status_enum NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Files table
CREATE TABLE IF NOT EXISTS public.job_order_files (
  id BIGSERIAL PRIMARY KEY,
  job_order_id BIGINT NOT NULL REFERENCES public.job_orders(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_job_orders_member_uuid ON public.job_orders (vip_member_uuid);
CREATE INDEX IF NOT EXISTS idx_job_orders_unique_id ON public.job_orders (vip_member_unique_id);
CREATE INDEX IF NOT EXISTS idx_job_orders_status ON public.job_orders (status);
CREATE INDEX IF NOT EXISTS idx_job_orders_created_at ON public.job_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_order_files_job_order_id ON public.job_order_files (job_order_id);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_job_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_job_orders_updated_at ON public.job_orders;
CREATE TRIGGER trg_set_job_orders_updated_at
BEFORE UPDATE ON public.job_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_job_orders_updated_at();

-- RLS: disabled by default for simplicity in the current demo stage
ALTER TABLE public.job_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_order_files DISABLE ROW LEVEL SECURITY;

-- Uncomment to enable later and add policies
-- ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.job_order_files ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read job orders" ON public.job_orders FOR SELECT TO public USING (true);
-- CREATE POLICY "Public read job order files" ON public.job_order_files FOR SELECT TO public USING (true);

