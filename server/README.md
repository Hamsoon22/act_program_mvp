# Program Builder - Minimal Backend (Express + SQLite)

## Quick start
```bash
cd server
cp .env.example .env
# edit SERVICE_API_KEY in .env
npm install
npm run dev
```
The API will run on `http://localhost:8787` by default.

## Auth
For MVP, include your API key in the header:
```
x-api-key: <SERVICE_API_KEY>
```

## Endpoints
- `GET /api/health` → `{ ok: true }`
- `POST /api/users` → upsert `{ id?, email?, displayName? }`
- `GET /api/diaries?userId=<id>` → list
- `POST /api/diaries` → create
- `PUT /api/diaries/:id` → update
- `DELETE /api/diaries/:id` → delete
- `GET /api/kv/:key` → fetch generic JSON
- `PUT /api/kv/:key` → save generic JSON

## Deploy
- Railway / Render: use Node 18+, persistent disk for `./data`.
- Set env vars: `PORT`, `SERVICE_API_KEY`, `DATABASE_PATH` (default `./data/app.db`).