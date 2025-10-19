-- Update RLS policy to allow unauthenticated users to view approved images
DROP POLICY IF EXISTS "Anyone can view approved images" ON gallery_images;

CREATE POLICY "Anyone can view approved images" 
ON gallery_images 
FOR SELECT 
USING (status = 'approved'::moderation_status);