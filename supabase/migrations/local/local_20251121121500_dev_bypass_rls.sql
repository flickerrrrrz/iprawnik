-- Local Migration: Bypass RLS for development
-- Date: 2024-11-21
-- Note: FOR DEVELOPMENT ONLY - Allows service role full access to all tables
-- This makes Supabase Studio work properly in local development

BEGIN;

-- Grant service role full access to bypass RLS
-- In local dev, service role is used by Studio and has special permissions

-- Tenants table
CREATE POLICY "Service role can do everything on tenants"
  ON public.tenants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users table
CREATE POLICY "Service role can do everything on users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Matters table
CREATE POLICY "Service role can do everything on matters"
  ON public.matters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Documents table
CREATE POLICY "Service role can do everything on documents"
  ON public.documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Document chunks table
CREATE POLICY "Service role can do everything on document_chunks"
  ON public.document_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Tasks table
CREATE POLICY "Service role can do everything on tasks"
  ON public.tasks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Task runs table
CREATE POLICY "Service role can do everything on task_runs"
  ON public.task_runs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Task attachments table
CREATE POLICY "Service role can do everything on task_attachments"
  ON public.task_attachments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Audit logs table
CREATE POLICY "Service role can do everything on audit_logs"
  ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMIT;
