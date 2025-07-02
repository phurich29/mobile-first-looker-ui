-- Create table for device visibility management by superadmin
CREATE TABLE public.admin_device_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_code TEXT NOT NULL,
  hidden_for_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(device_code)
);

-- Enable RLS
ALTER TABLE public.admin_device_visibility ENABLE ROW LEVEL SECURITY;

-- Only superadmin can manage device visibility
CREATE POLICY "Only superadmin can manage device visibility" 
ON public.admin_device_visibility 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_admin_device_visibility_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_admin_device_visibility_updated_at
BEFORE UPDATE ON public.admin_device_visibility
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_device_visibility_updated_at();