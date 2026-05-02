-- Fix #1: Add missing status values to request_status enum
-- The UI uses under_review, price_sent, delivered but these were missing from the DB enum

ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'price_sent';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'delivered';
