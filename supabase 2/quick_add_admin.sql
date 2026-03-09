-- Add yourself as admin user
-- Replace 'your-email@example.com' with your actual email

INSERT INTO public.admins (user_id, email, name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', email)
FROM auth.users
WHERE email = 'mohamed.alshaibani@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email, name = EXCLUDED.name;

-- Verify you were added
SELECT * FROM public.admins WHERE email = 'mohamed.alshaibani@gmail.com';
