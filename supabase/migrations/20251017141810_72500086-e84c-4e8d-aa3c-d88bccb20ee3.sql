-- Add locked field to hall_of_fame table
ALTER TABLE public.hall_of_fame 
ADD COLUMN locked boolean NOT NULL DEFAULT false;

-- Update RLS policy to prevent non-admins from editing locked entries
DROP POLICY IF EXISTS "Anyone can update hall of fame" ON public.hall_of_fame;

CREATE POLICY "Users can update unlocked hall of fame entries"
ON public.hall_of_fame
FOR UPDATE
USING (NOT locked OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (NOT locked OR has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any entry (including locked status)
CREATE POLICY "Admins can update any hall of fame entry"
ON public.hall_of_fame
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));