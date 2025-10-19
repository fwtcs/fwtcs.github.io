-- Create hall_of_fame table for featured profiles
CREATE TABLE public.hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Add Name',
  image_url text,
  social_link_1 text,
  social_link_2 text,
  position integer NOT NULL UNIQUE CHECK (position >= 1 AND position <= 19),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Anyone can view hall of fame"
ON public.hall_of_fame
FOR SELECT
TO public
USING (true);

-- Only admins can update profiles
CREATE POLICY "Admins can update hall of fame"
ON public.hall_of_fame
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert profiles
CREATE POLICY "Admins can insert hall of fame"
ON public.hall_of_fame
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert 19 empty slots
INSERT INTO public.hall_of_fame (position, name)
SELECT generate_series(1, 19), 'Add Name';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.hall_of_fame;