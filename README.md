# ðŸŽµ Heart Beats Practice App

A practice app for music students to track progress, complete assignments, and earn badges.

## Project Structure

```
heartbeats-practice-app/
â”œâ”€â”€ public/               # Static assets
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/       # Reusable React components
â”‚   â”œâ”€â”€ pages/            # Page components
â”‚   â”œâ”€â”€ hooks/            # Custom React hooks
â”‚   â”œâ”€â”€ lib/              # Utilities and helpers
â”‚   â”œâ”€â”€ styles/           # CSS files
â”‚   â”œâ”€â”€ App.js           # Main app component
â”‚   â”œâ”€â”€ App.css          # Main styles
â”‚   â”œâ”€â”€ index.js         # React entry point
â”‚   â””â”€â”€ index.css        # Global styles
â”œâ”€â”€ package.json         # Dependencies
â”œâ”€â”€ .env                 # Environment variables
â””â”€â”€ .gitignore          # Git ignore patterns
```

## Setup

1. Install dependencies:
   npm install

2. Set up Supabase:
   - Create Supabase account at https://supabase.com
   - Create new project
   - Copy credentials to .env

3. Start development server:
   npm start

## Sprint 1: Auth + Schema

- [x] Project scaffolding
- [ ] Supabase schema design
- [ ] Teacher + Student login screens
- [ ] Testing & feedback

## Tech Stack

- React 18
- Supabase (PostgreSQL + Auth)
- Netlify (deployment)
- GitHub (version control)
