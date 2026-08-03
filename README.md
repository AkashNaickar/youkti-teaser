# Youkti ΓÇö The Outbound Agentic OS (Teaser Site)

A marketing site I designed and built from scratch for **Youkti.ai**, an AI-native B2B sales-execution platform. This was a portfolio project I worked on before Youkti launched its public site ΓÇö it's not affiliated with or endorsed by the company.

**Live site:** https://youkti-teaser.vercel.app/

![Youkti teaser preview](screenshots/youkti-teaser-preview.png)

## What it is

Youkti tells sales reps exactly *who to reach, what to pitch, and what to do next* ΓÇö it calls itself an "outbound agentic OS" powered by a GTM agent named **ARYA**. The teaser site had to make that pitch feel tangible, not like marketing fluff:

- A hero with an interactive ARYA prompt ΓÇö type a campaign description and get a built cockpit back
- A hand-coded Cockpit mockup with account rows, ARYA's suggestions, live pipeline stats, and a signal watchlist
- A pinned-scroll walkthrough that scrubs through four real product screenshots as you scroll
- Four product tiles (Execute, Account Research, Outreach Automation, Competitive Intelligence) with looping mini-demos
- An ARYA section with an auto-playing chat demo and typewriter text
- Trust band with animated counters, personas, integrations, a proof spotlight, FAQ accordion, video testimonials, CTA, and footer

## How it's built

- **Plain HTML/CSS/JS** ΓÇö no frameworks, no build step
- **GSAP + ScrollTrigger** for the loader, scroll progress, reveals, pinned walkthrough, and counters
- **Canvas** for the animated hero background
- Fully responsive, with `prefers-reduced-motion` support throughout

## Things I'm happy with

- No framework runtime, no build step ΓÇö just static files on Vercel with immutable caching for `/assets`
- Every GSAP effect degrades to a no-JS / reduced-motion fallback, so the site still works if animations fail
- The product mockup and mini-demos are pure HTML/CSS, not screenshots ΓÇö only the walkthrough uses real product images

## Run it locally

```bash
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Project structure

```
.
Γö£ΓöÇΓöÇ index.html          # single-page markup
Γö£ΓöÇΓöÇ css/style.css       # design system + animation layer
Γö£ΓöÇΓöÇ js/main.js          # GSAP interactions + fallbacks
Γö£ΓöÇΓöÇ assets/             # logo, favicon, product screenshots, partner & integration logos
Γö£ΓöÇΓöÇ images/             # UI icons (SVG)
Γö£ΓöÇΓöÇ vercel.json         # caching headers
ΓööΓöÇΓöÇ screenshots/        # README preview
```

## Notes

- Built as a portfolio piece to show frontend engineering and motion design.
- Content is a concept/teaser ΓÇö not the official Youkti marketing copy.
