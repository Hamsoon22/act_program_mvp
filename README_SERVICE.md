# Service-Ready Setup (Frontend + Minimal Backend)

## 1) Backend
```
cd server
cp .env.example .env
# edit SERVICE_API_KEY
npm install
npm run dev
```

## 2) Frontend
```
cp .env.example .env
# edit VITE_API_URL and VITE_API_KEY to match server
npm install
npm run dev
```

## Deploy tips
- Backend: Railway/Render with persistent disk for `server/data/`.
- Frontend: Netlify/Vercel; set environment variables to point to backend URL.