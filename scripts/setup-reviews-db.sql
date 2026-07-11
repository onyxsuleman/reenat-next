-- ========================================================
-- REENAT TRENDS SOCIAL REVIEWS & Q&A HUB SETUP SCRIPT
-- ========================================================

-- 1. Create the community_threads table
CREATE TABLE IF NOT EXISTS public.community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer REFERENCES public.products(id) ON DELETE CASCADE,
  thread_type text NOT NULL CHECK (thread_type IN ('review', 'question')),
  created_at timestamp with time zone DEFAULT now(),
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_avatar_url text,
  is_verified_buyer boolean DEFAULT false,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  draping_tag text CHECK (draping_tag IN ('Traditional Maharashtrian', 'Modern Open Pallu', 'Gujarati Style', 'Bengali Draping', 'Mumtaz Retro Style', 'Casual Nivi')),
  texture_perception integer CHECK (texture_perception BETWEEN 1 AND 5), -- 1: Soft -> 5: Stiff
  weight_perception integer CHECK (weight_perception BETWEEN 1 AND 5),  -- 1: Light -> 5: Heavy
  photo_request_count integer DEFAULT 0,
  photo_url text,
  replies jsonb DEFAULT '[]'::jsonb
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;

-- 3. Setup public access policies
DROP POLICY IF EXISTS "Allow public read community_threads" ON public.community_threads;
DROP POLICY IF EXISTS "Allow public insert community_threads" ON public.community_threads;
DROP POLICY IF EXISTS "Allow public update community_threads" ON public.community_threads;
DROP POLICY IF EXISTS "Allow public delete community_threads" ON public.community_threads;

CREATE POLICY "Allow public read community_threads" ON public.community_threads FOR SELECT USING (true);
CREATE POLICY "Allow public insert community_threads" ON public.community_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update community_threads" ON public.community_threads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete community_threads" ON public.community_threads FOR DELETE USING (true);

-- 4. Seed Mock Data for Product ID 42 (NSY0042 - Navy Blue Paithani Saree)
-- Verify if products exist first to avoid FK constraint error
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.products WHERE id = 42) THEN
    -- Clear existing mock threads for this product to prevent duplicate runs
    DELETE FROM public.community_threads WHERE product_id = 42;

    -- Review 1: Ananya Sharma (Verified Buyer)
    INSERT INTO public.community_threads (
      product_id, thread_type, user_id, user_name, is_verified_buyer, rating, content, draping_tag, texture_perception, weight_perception, photo_request_count
    ) VALUES (
      42, 'review', 'user_ananya_sharma', 'Ananya Sharma', true, 5, 
      'Beautiful drape and the fabric quality is exceptional! The border has a genuine, high-quality antique zari finish that shines elegantly under direct light. Wore it for a wedding and received numerous compliments.', 
      'Traditional Maharashtrian', 2, 3, 0
    );

    -- Review 2: Priya K (Verified Buyer)
    INSERT INTO public.community_threads (
      product_id, thread_type, user_id, user_name, is_verified_buyer, rating, content, draping_tag, texture_perception, weight_perception, photo_request_count
    ) VALUES (
      42, 'review', 'user_priya_k', 'Priya K.', true, 4, 
      'Very comfortable for long hours. The cotton-silk blend is breathable and doesn''t feel heavy at all. The border is slightly stiff initially but softens after the first dry clean.', 
      'Modern Open Pallu', 3, 2, 2
    );

    -- Question 1: Community Q&A with answers
    INSERT INTO public.community_threads (
      product_id, thread_type, user_id, user_name, is_verified_buyer, content, photo_request_count, replies
    ) VALUES (
      42, 'question', 'user_meera_rao', 'Meera Rao', false, 
      'Is the blouse piece included of the same navy color or is it a contrast color?', 
      5, 
      '[
        {
          "id": "reply_1",
          "user": { "name": "Reenat Trends Staff", "is_verified_buyer": false, "is_artisan_or_staff": true },
          "content": "Hello Meera! Yes, the saree comes with a contrast green zari woven blouse piece as shown in the specifications (Contrast Blouse).",
          "created_at": "2026-07-10T12:00:00Z"
        },
        {
          "id": "reply_2",
          "user": { "name": "Ananya Sharma", "is_verified_buyer": true, "is_artisan_or_staff": false },
          "content": "Can confirm! The green contrast looks absolutely stunning against the deep navy blue of the saree.",
          "created_at": "2026-07-10T14:30:00Z"
        }
      ]'::jsonb
    );

  END IF;
END $$;
