-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can upload images" ON gallery_images;

-- Create new insert policy for regular users (pending only)
CREATE POLICY "Users can upload pending images" 
ON gallery_images 
FOR INSERT 
WITH CHECK (status = 'pending'::moderation_status);

-- Create new insert policy for admins (can set any status)
CREATE POLICY "Admins can upload approved images" 
ON gallery_images 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND 
  (status = 'approved'::moderation_status OR status = 'pending'::moderation_status)
);