
-- Create rice_prices_addon table
CREATE TABLE public.rice_prices_addon (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT,
  category TEXT NOT NULL,
  priceColor TEXT DEFAULT 'black',
  document_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER handle_updated_at_rice_prices_addon
  BEFORE UPDATE ON public.rice_prices_addon
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add Row Level Security (RLS) - making it publicly readable like rice_prices
ALTER TABLE public.rice_prices_addon ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
  ON public.rice_prices_addon 
  FOR SELECT 
  USING (true);

-- Create policy for admin/superadmin write access
CREATE POLICY "Allow admin write access" 
  ON public.rice_prices_addon 
  FOR ALL 
  USING (public.is_admin_or_superadmin())
  WITH CHECK (public.is_admin_or_superadmin());
