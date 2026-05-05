# Part D Local Run

This branch adds the BE-2 demo flow: breach photo upload, breach report persistence, and mock refund confirmation.

## Setup

Install dependencies:

```bash
npm install
cd backend
npm install
```

Create optional env files from the examples:

```bash
copy .env.example .env
cd ..
copy .env.example .env.local
```

The frontend defaults to `http://localhost:3001`, so `.env.local` is only needed if the API port changes.

## Run

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open:

- Consumer app: `http://localhost:5173`
- Admin dashboard: `http://localhost:5173/admin`
- QR generator: `http://localhost:5173/generate`
- Backend health: `http://localhost:3001`

## Demo Flow

1. Open the consumer app and choose a breached mock order, such as `ORD-002`.
2. Submit a breach report with a real photo or the demo photo button.
3. Confirm that the confirmation page shows a `BR-...` reference ID.
4. Open the admin dashboard and confirm the report appears in Live Breach Reports.

Runtime breach data is written to `backend/data/`, and uploaded photos are written to `backend/uploads/`.

For deployment, set the backend `FRONTEND_URL` to the Vercel URL, for example `https://coldchain-rouge.vercel.app`, so generated QR codes point to the live scanner.
