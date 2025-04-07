
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read avatar files (public access)
CREATE POLICY "Avatar files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatar files
CREATE POLICY "Users can upload their own avatar files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their avatar files
CREATE POLICY "Users can update their own avatar files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to delete their avatar files
CREATE POLICY "Users can delete their own avatar files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
