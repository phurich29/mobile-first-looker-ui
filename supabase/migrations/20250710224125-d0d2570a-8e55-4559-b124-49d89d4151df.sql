-- Create shared_analysis_links table
CREATE TABLE public.shared_analysis_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraint to rice_quality_analysis
ALTER TABLE public.shared_analysis_links 
ADD CONSTRAINT fk_shared_analysis_links_analysis_id 
FOREIGN KEY (analysis_id) REFERENCES public.rice_quality_analysis(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_shared_analysis_links_share_token ON public.shared_analysis_links(share_token);
CREATE INDEX idx_shared_analysis_links_user_id ON public.shared_analysis_links(user_id);
CREATE INDEX idx_shared_analysis_links_analysis_id ON public.shared_analysis_links(analysis_id);

-- Enable Row Level Security
ALTER TABLE public.shared_analysis_links ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own links
CREATE POLICY "Users can view their own shared links" 
ON public.shared_analysis_links 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own links
CREATE POLICY "Users can create their own shared links" 
ON public.shared_analysis_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own links
CREATE POLICY "Users can update their own shared links" 
ON public.shared_analysis_links 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own links
CREATE POLICY "Users can delete their own shared links" 
ON public.shared_analysis_links 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policy: Public can view active shared links by token (for public access)
CREATE POLICY "Public can view active shared links by token" 
ON public.shared_analysis_links 
FOR SELECT 
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_shared_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shared_analysis_links_updated_at
BEFORE UPDATE ON public.shared_analysis_links
FOR EACH ROW
EXECUTE FUNCTION public.update_shared_links_updated_at();