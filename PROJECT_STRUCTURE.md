# College Swap — Project Structure

```
college-swap/
├── frontend/                  # React app (deploy to Vercel)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── OfferModal.jsx
│   │   │   └── ChatWindow.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── PostListing.jsx
│   │   │   ├── MyListings.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.local
│
├── backend/                   # Express API (deploy to Railway)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── offers.js
│   │   └── messages.js
│   ├── middleware/
│   │   └── auth.js
│   ├── db/
│   │   └── schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```
