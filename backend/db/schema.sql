-- ============================================================
-- College Swap — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS (extends Supabase auth.users) ────────────────────
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  college     TEXT NOT NULL,
  avatar_url  TEXT,
  rating      FLOAT DEFAULT 5.0,
  rating_count INT DEFAULT 0,
  bio         TEXT,
  whatsapp    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CATEGORIES ─────────────────────────────────────────────
CREATE TABLE public.categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  icon  TEXT
);

INSERT INTO public.categories (name, icon) VALUES
  ('Books & Notes', '📚'),
  ('Electronics', '💻'),
  ('Furniture', '🪑'),
  ('Clothing', '👕'),
  ('Sports & Fitness', '🏋️'),
  ('Kitchen & Appliances', '🍳'),
  ('Stationery', '✏️'),
  ('Cycles & Vehicles', '🚲'),
  ('Musical Instruments', '🎸'),
  ('Other', '📦');

-- ─── LISTINGS ───────────────────────────────────────────────
CREATE TABLE public.listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  is_negotiable BOOLEAN DEFAULT TRUE,
  category_id   INT REFERENCES public.categories(id),
  condition     TEXT CHECK (condition IN ('new','like_new','good','fair','poor')) DEFAULT 'good',
  status        TEXT CHECK (status IN ('active','sold','reserved','deleted')) DEFAULT 'active',
  college       TEXT NOT NULL,
  image_urls    TEXT[] DEFAULT '{}',
  view_count    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── OFFERS ─────────────────────────────────────────────────
CREATE TABLE public.offers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  offered_price NUMERIC(10,2) NOT NULL,
  message       TEXT,
  status        TEXT CHECK (status IN ('pending','accepted','rejected','cancelled','completed')) DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MESSAGES ───────────────────────────────────────────────
CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id    UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RATINGS ────────────────────────────────────────────────
CREATE TABLE public.ratings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id    UUID NOT NULL REFERENCES public.offers(id),
  rater_id    UUID NOT NULL REFERENCES public.users(id),
  rated_id    UUID NOT NULL REFERENCES public.users(id),
  score       INT CHECK (score BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SAVED LISTINGS ─────────────────────────────────────────
CREATE TABLE public.saved_listings (
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id  UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_listings_user     ON public.listings(user_id);
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_listings_college  ON public.listings(college);
CREATE INDEX idx_listings_status   ON public.listings(status);
CREATE INDEX idx_offers_listing    ON public.offers(listing_id);
CREATE INDEX idx_offers_buyer      ON public.offers(buyer_id);
CREATE INDEX idx_messages_offer    ON public.messages(offer_id);

-- ─── AUTO UPDATE updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTO UPDATE USER RATING ────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET rating = (SELECT AVG(score) FROM public.ratings WHERE rated_id = NEW.rated_id),
      rating_count = (SELECT COUNT(*) FROM public.ratings WHERE rated_id = NEW.rated_id)
  WHERE id = NEW.rated_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_rating AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION refresh_user_rating();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings        ENABLE ROW LEVEL SECURITY;

-- Users: anyone can view, only self can edit
CREATE POLICY "users_select_all"   ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "users_insert_self"  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_self"  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Listings: anyone can view active, only owner can modify
CREATE POLICY "listings_select_active" ON public.listings FOR SELECT USING (status != 'deleted');
CREATE POLICY "listings_insert_auth"   ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_update_owner"  ON public.listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings_delete_owner"  ON public.listings FOR DELETE USING (auth.uid() = user_id);

-- Offers: only buyer/seller can view
CREATE POLICY "offers_select_parties"  ON public.offers FOR SELECT USING (auth.uid() IN (buyer_id, seller_id));
CREATE POLICY "offers_insert_buyer"    ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "offers_update_parties"  ON public.offers FOR UPDATE USING (auth.uid() IN (buyer_id, seller_id));

-- Messages: only offer participants can view/send
CREATE POLICY "messages_select" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.offers o WHERE o.id = offer_id AND auth.uid() IN (o.buyer_id, o.seller_id)));
CREATE POLICY "messages_insert" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.offers o WHERE o.id = offer_id AND auth.uid() IN (o.buyer_id, o.seller_id)));

-- Saved listings
CREATE POLICY "saved_select_own"  ON public.saved_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_own"  ON public.saved_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_own"  ON public.saved_listings FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket (run in Supabase Storage section)
-- Create a bucket called 'listing-images' with public access
-- Create a bucket called 'avatars' with public access
