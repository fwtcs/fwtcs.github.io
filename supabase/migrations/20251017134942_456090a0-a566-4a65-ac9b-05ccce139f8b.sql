-- Update RLS policy to allow anyone to update hall of fame entries
DROP POLICY IF EXISTS "Admins can update hall of fame" ON public.hall_of_fame;

CREATE POLICY "Anyone can update hall of fame"
ON public.hall_of_fame
FOR UPDATE
USING (true)
WITH CHECK (true);