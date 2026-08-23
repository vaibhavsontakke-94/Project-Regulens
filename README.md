# Synora — AI Assistant

A full-stack AI assistant with text chat, voice conversation, translation, and document uploads. Express + vanilla frontend, powered by the Groq API.

## Features

- **Chat** — streaming AI responses with real conversation history (persisted server-side)
- **Voice commands** — hands-free app control: "open settings", "go to translate", "new chat", "dark mode", "start dictation", "help"
- **Voice** — browser microphone recording → speech-to-text → chat with spoken replies (auto-read with a female voice)
- **Dictation** — global mic button types directly into any input by voice
- **Translate** — real-time translation between 8 languages (dictation + audio playback + copy)
- **Documents** — upload a text file and chat about its contents; the file is added to the conversation context
- **Personality** — friendly, professional, creative, or concise tone
- **Settings & Profile** — in-app panels with appearance, voice, AI behavior, memory, privacy
- **Responsive** — desktop sidebar, tablet, mobile drawer + bottom nav
- **Dark mode** — persisted preference

## Setup

```bash
npm install
```

Create a `.env` file from the template (never commit it):

```env
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_VISION=qwen/qwen3.6-27b
GROQ_MODEL_WHISPER=whisper-large-v3-turbo
PORT=3000

# Optional: full features (auth + persisted history)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Get a key at https://console.groq.com/keys

## Run

```bash
npm start        # production
npm run dev      # dev with auto-reload
```

Open http://localhost:3000

## Deploy to Netlify

The app is Netlify-ready: static assets are published from `public/` and every
`/api/*` route runs in a serverless function that wraps the Express app
(`netlify/functions/api.js`, configured in `netlify.toml`).

1. Push this repo to GitHub, then create a new site in Netlify from that repo.
2. In the Netlify dashboard (Site settings → Environment variables), add every
   key from your local `.env`. `netlify.toml` already sets the build command
   (`npm run build`) and publish directory (`public`).
3. Run `supabase/schema.sql` in your Supabase SQL editor (creates
   `chat_history` and `profiles` tables).
4. Deploy — the site is served at `https://<site-name>.netlify.app`.

Environment variables (never commit these):

| Group | Variables | Purpose |
| ----- | --------- | ------- |
| Groq (required) | `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_MODEL_VISION`, `GROQ_MODEL_WHISPER` | Chat, vision, translation, voice, transcription |
| Groq (optional) | `GROQ_MODEL_TTS`, `GROQ_MODEL_TTS_AR`, `GROQ_BASE_URL` | TTS model overrides |
| Firebase (for auth) | `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID` | Sign in/sign up, account sync |
| Supabase (for persistence) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Chat history + user profiles (server-side only) |

Notes:

- **Secrets are server-side only.** The frontend never sees Groq or Supabase
  keys; Firebase config is served to the browser via `/api/firebase-config`.
- Before your first deploy, remove `node_modules/`, `.env`, and `data/` from
  git (`git rm -r --cached node_modules data .env`) so secrets stay out of the
  repo and Netlify installs fresh dependencies.
- SSE chat replies arrive as one buffered response on Netlify Functions (no
  token-by-token streaming). Function limits: 60s execution, 6 MB buffered
  request body (short voice clips transcribe fine), 20 MB streamed response.
- Chat history and user profiles persist in Supabase; there is no local
  filesystem persistence on Netlify.

## API

| Method | Route                     | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/health`             | Server + AI configuration status         |
| GET    | `/api/chats`              | List conversation summaries              |
| POST   | `/api/chats`              | Create a conversation (optionally with `documents`) |
| GET    | `/api/chats/:id`          | Full conversation with messages          |
| DELETE | `/api/chats`              | Clear all conversations (clear memory)   |
| DELETE | `/api/chats/:id`          | Delete one conversation                  |
| POST   | `/api/chats/:id/messages` | Send a message; streams AI reply (SSE)   |
| POST   | `/api/translate`          | `{ text, source, target }` → translation |
| POST   | `/api/transcribe`         | Raw audio bytes → text (Whisper)         |

Conversations and user profiles are stored in Supabase when configured.
