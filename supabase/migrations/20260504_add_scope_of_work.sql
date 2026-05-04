-- Add scope_of_work column to service_requests
-- This is a mandatory field admin must fill when sending a proposal
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS scope_of_work text;
