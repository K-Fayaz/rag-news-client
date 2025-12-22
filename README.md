# AI News Assistant – Client

#LIVE
https://rag-news-client.vercel.app/

React + TypeScript frontend for the RAG-backed news assistant. Provides a chat
UI, persists session IDs locally, and talks to the backend for answers.

## Stack
- React, TypeScript, Vite
- Axios for API calls
- Tailwind CSS styles (see `App.css`/`index.css`)

## Prerequisites
- Node.js 18+
- Backend running (default `http://localhost:8080`)

## Environment / Config
- API base URL is set in `src/config.ts` (`DEV_BASE` / `PROD_BASE`). Update
  `BASE_URL` to point at your backend before building.

## Install & Run
```bash
cd client
npm install
npm run dev
```
Visit the printed localhost port (Vite default `5173`).

## App Flow (`src/App.tsx`)
- On load, if no `sessionId` in `localStorage`, seeds a welcome bot message. If a
  session exists, fetches history from `GET /api/history/:sessionId`.
- Sending a message posts to `POST /api/chat` with the `sessionId` (if present).
  The backend returns the bot reply and a new `sessionId` if it was the first
  turn; the client stores it in `localStorage`.
- Messages are appended locally for immediate UI feedback; bot replies animate in
  after a short delay.
- “Reset Session” calls `DELETE /api/session/:sessionId`, clears local storage,
  and restores the initial welcome message.

## Key Components
- `src/App.tsx` — Main chat experience, session handling, message list, form.
- `src/config.ts` — API base URL toggle.
- `src/App.css` / `src/index.css` — Styling and typing indicator.

## DEMO
https://drive.google.com/file/d/1SwE5udZZ7LYy9rqrhyvIjGNQTArvgOhV/view?usp=sharing

## Code Walkthrough
https://drive.google.com/file/d/1NNx6Om_ctVYRbsy2q12g3J3RaciOcv_c/view?usp=sharing

## API Endpoints Used
- `POST /api/chat` — Send user query and get bot response.
- `GET /api/history/:sessionId` — Load prior turns for an existing session.
- `DELETE /api/session/:sessionId` — Clear a session’s history (used by reset).
