-- Add rejection_reason column to service_requests
ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add progress_note column to tasks (employee progress updates)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS progress_note text;
