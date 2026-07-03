# Brainstorm Agent

A lightweight MVP for structuring group brainstorming sessions and pressure-testing ideas with a **Hackathon Evaluator**.

## What it does

1. **Input Dashboard** — Log multiple ideas with pain points, risks, and target segments.
2. **Evaluation Matrix** — Ideas are ranked strongest → weakest with clear **SHIP IT** or **SKIP IT** verdicts.

## Quick start

You need [Node.js](https://nodejs.org/) installed (version 18 or newer).

```bash
# 1. Open a terminal in this folder, then install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

## Connect real AI (OpenAI)

1. Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Copy the example env file and add your key:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` and replace `sk-your-key-here` with your real key.
4. Restart the dev server (`Ctrl+C`, then `npm run dev` again).

The app uses **gpt-4o-mini** by default (fast and inexpensive). Override with `OPENAI_MODEL` in `.env.local` if needed.

Without an API key, the app falls back to offline rule-based scoring.

## How to use

1. Fill in at least one idea (the **Idea** field is required).
2. Add optional context: **Pain**, **Biggest Risk**, and **Segment** — more detail = better rankings.
3. Click **Add Another Idea** to log more ideas in one session.
4. Click **Submit to Evaluator** to see ranked results.
5. Use **Back to Input Dashboard** to refine and re-submit.

## Project structure

```
app/              → Pages and layout
components/       → Input form & results UI
lib/              → Evaluator logic & types
```

## Production build

```bash
npm run build
npm start
```

## Next steps (optional)

- Add persistence (localStorage or a database) to save sessions.
- Export results as PDF or shareable link.
- Swap OpenAI for Anthropic or another provider in `lib/ai-evaluator.ts`.
