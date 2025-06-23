
-- Create table for managing guest device access
CREATE TABLE public.guest_device_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_code TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_code)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.guest_device_access ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage guest access
CREATE POLICY "Admins can manage guest device access" 
  ON public.guest_device_access 
  FOR ALL 
  USING (public.is_admin_or_superadmin())
  WITH CHECK (public.is_admin_or_superadmin());

-- Add trigger for updating the updated_at timestamp
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.guest_device_access 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
