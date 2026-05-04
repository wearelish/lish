-- Add scope_of_work and delivery fields to service_requests
-- These fields are required for the full proposal and delivery workflow

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS scope_of_work TEXT,
  ADD COLUMN IF NOT EXISTS proposal_note TEXT,
  ADD COLUMN IF NOT EXISTS proposal_deadline DATE,
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
  ADD COLUMN IF NOT EXISTS delivery_file_url TEXT,
  ADD COLUMN IF NOT EXISTS delivery_note TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.service_requests.scope_of_work IS
  'Detailed scope of work defined by admin when sending a proposal. Required field before sending proposal.';

COMMENT ON COLUMN public.service_requests.proposal_note IS
  'Optional note from admin to client when sending a price proposal.';

COMMENT ON COLUMN public.service_requests.delivery_file_url IS
  'URL to the delivered project files (Google Drive, Dropbox, etc.). Locked until final payment.';
