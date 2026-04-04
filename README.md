# CollegeSwap 🔄

A marketplace for students to buy, sell, and swap items within their college community.

---

## Features

- Browse listings by category, condition, price range, and college
- Post items with up to 5 photos
- Make & receive offers with negotiated pricing
- Real-time chat between buyer and seller (Supabase Realtime)
- Seller ratings and reviews after completed deals
- WhatsApp shortcut for quick contact
- Saved listings
- Profile pages with listing history

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18 + Tailwind CSS + Vite |
| Backend   | Node.js + Express |
| Database  | PostgreSQL via Supabase |
| Auth      | Supabase Auth (email/password) |
| Storage   | Supabase Storage (images) |
| Realtime  | Supabase Realtime (chat) |
| Deploy FE | Vercel |
| Deploy BE | Railway |

---

## Step-by-Step Setup

### 1. Create a Supabase project

1. Go to https://supabase.com → New project
2. Choose a name (e.g. `college-swap`) and a strong DB password
3. Wait for it to provision (~1 min)

### 2. Run the database schema

1. In Supabase → SQL Editor
2. Paste the entire contents of `backend/db/schema.sql`
3. Click **Run**

### 3. Set up Supabase Storage

1. Supabase → Storage → New bucket: `listing-images` → Public ✅
2. New bucket: `avatars` → Public ✅

### 4. Get your Supabase keys

Go to Supabase → Settings → API. You need:
- **Project URL** → `https://xxxx.supabase.co`
- **anon/public key** → for the frontend
- **service_role key** → for the backend (keep this secret!)

---

### 5. Set up the Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev        # runs on http://localhost:4000
```

**.env:**
```
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
```

---

### 6. Set up the Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in your values
npm install
npm run dev        # runs on http://localhost:5173
```

**.env.local:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000/api
```

---

### 7. Deploy Backend to Railway

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your `backend` folder (or push just the backend as a separate repo)
3. Add environment variables (same as .env)
4. Railway gives you a public URL like `https://college-swap-api.railway.app`

---

### 8. Deploy Frontend to Vercel

1. Go to https://vercel.com → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` → your Railway backend URL + `/api`
4. Deploy!

---

## Project Structure

```
college-swap/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── OfferModal.jsx
│   │   │   └── ChatWindow.jsx
│   │   ├── pages/            # Route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── PostListing.jsx
│   │   │   ├── MyListings.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── lib/
│   │       └── supabase.js
│   └── ...config files
│
└── backend/
    ├── routes/
    │   ├── auth.js
    │   ├── listings.js
    │   ├── offers.js
    │   └── messages.js
    ├── middleware/
    │   └── auth.js
    ├── db/
    │   └── schema.sql
    └── server.js
```

---

## API Reference

### Listings
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/listings | Browse with filters |
| GET | /api/listings/:id | Single listing |
| POST | /api/listings | Create listing (auth) |
| PATCH | /api/listings/:id | Update listing (owner) |
| DELETE | /api/listings/:id | Soft delete (owner) |
| GET | /api/listings/user/:userId | User's listings |
| POST | /api/listings/:id/save | Save listing (auth) |

### Offers
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/offers | Make offer (auth) |
| GET | /api/offers/mine | My offers (auth) |
| PATCH | /api/offers/:id/status | Accept/reject/cancel (auth) |
| POST | /api/offers/:id/rate | Rate after completion |

### Messages
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/messages/offer/:offerId | Get thread (auth) |
| POST | /api/messages/offer/:offerId | Send message (auth) |
| GET | /api/messages/unread-count | Unread count (auth) |

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Create account |
| GET | /api/auth/me | Get my profile (auth) |
| PATCH | /api/auth/me | Update profile (auth) |
| GET | /api/auth/profile/:userId | Public profile |

---

## Possible Future Features

- Push notifications (web push API)
- College email (.edu / .ac.in) verification
- In-app payment integration (Razorpay for India)
- Report/flag listings
- Admin dashboard
- Mobile app (React Native)
- Google Maps integration for meetup spots
- Bulk listing import for hostels/departing seniors
