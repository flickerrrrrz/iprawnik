-- Auto-create user and tenant on signup
-- This trigger automatically creates a tenant and user record when someone signs up via Supabase Auth

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  tenant_name TEXT;
  tenant_slug TEXT;
BEGIN
  -- Generate tenant name from email (first part before @)
  tenant_name := split_part(NEW.email, '@', 1) || '''s Firm';
  
  -- Generate unique slug
  tenant_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  
  -- Create new tenant for this user
  INSERT INTO public.tenants (name, slug)
  VALUES (tenant_name, tenant_slug)
  RETURNING id INTO new_tenant_id;
  
  -- Create user record
  INSERT INTO public.users (
    id,
    tenant_id,
    email,
    full_name,
    role
  ) VALUES (
    NEW.id,
    new_tenant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'owner' -- First user is always owner of their tenant
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.tenants TO authenticated;
