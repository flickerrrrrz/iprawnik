-- Fix script for existing user: michalppawlik@gmail.com
-- Run this in Supabase SQL Editor

-- First, get the user ID from auth.users
-- Then create tenant and user record

DO $$
DECLARE
  user_id UUID;
  user_email TEXT := 'michalppawlik@gmail.com';
  new_tenant_id UUID;
BEGIN
  -- Get user ID from auth
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in auth.users', user_email;
  END IF;
  
  -- Check if user already exists in public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    RAISE NOTICE 'User already exists in public.users';
    RETURN;
  END IF;
  
  -- Create tenant
  INSERT INTO public.tenants (name, slug)
  VALUES ('Michał''s Law Firm', 'michalppawlik-firm')
  RETURNING id INTO new_tenant_id;
  
  -- Create user
  INSERT INTO public.users (
    id,
    tenant_id,
    email,
    full_name,
    role
  ) VALUES (
    user_id,
    new_tenant_id,
    user_email,
    'Michał Pawlik',
    'owner'
  );
  
  RAISE NOTICE 'Created tenant % and user for %', new_tenant_id, user_email;
END $$;
