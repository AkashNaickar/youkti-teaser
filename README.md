# Youkti — The Outbound Agentic OS (Teaser Site)

A high-fidelity, animated marketing site I designed and built for **Youkti.ai**, an AI-native B2B sales-execution platform. It was crafted as a freelance/portfolio project before Youkti launched its public site, and is not affiliated with or endorsed by the company.

![Youkti teaser preview](screenshots/youkti-teaser-preview.png)

## 🔗 Live demo

- **Live:** https://youkti-teaser.vercel.app/
- **Deploy:** Vercel (static hosting, immutable asset caching via `vercel.json`)

## 🧠 The brief

Youkti tells sales reps exactly *who to reach, what to pitch, and what to do next* — an "outbound agentic OS" powered by its GTM agent **ARYA**. The site had to make that feel real:

- **Hero** — interactive ARYA prompt: type a campaign description, get a "campaign built" cockpit result.
- **Product-UI mockup** — a fully hand-coded Cockpit with account rows, ARYA suggestions, live pipeline stats, and a signal watchlist.
- **Pinned-scroll walkthrough** — signal → sequence story driven by GSAP ScrollTrigger, scrubbing through four real product screenshots.
- **Platform grid** — four products (Execute, Account Research, Outreach Automation, Competitive Intelligence) with looping "Razorpay-style" mini demos.
- **ARYA section** — an auto-playing chat demo with typewriter effects and a replay button.
- Trust band with animated counters, personas, integrations, proof spotlight, FAQ accordion, video testimonials, CTA, and footer.

## 🛠 Tech stack

- **HTML5** — semantic, accessible markup (ARIA labels, keyboard support)
- **CSS** — custom design system via CSS custom properties; no frameworks
- **Vanilla JavaScript** — module-free, IIFE-scoped, no build step
- **GSAP + ScrollTrigger** — loader, scroll progress, reveals, pinned walkthrough, counters, micro-interactions
- **Canvas** — animated hero dot-wave background
- **Fully responsive** with `prefers-reduced-motion` support throughout

## ✨ Highlights

- **Performance-minded:** no framework runtime, no build step, static deploy, immutable caching for `/assets`.
- **Resilient:** every GSAP feature degrades gracefully to a no-JS / reduced-motion fallback (IntersectionObserver reveals).
- **Hand-crafted UI:** the product mockup and all mini-demos are pure HTML/CSS, not screenshots — except the real product shots in the walkthrough.

## 🚀 Run locally

```bash
# serve the static folder
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080`.

## 📁 Project structure

```
.
├── index.html          # single-page markup
├── css/style.css       # design system + animation layer
├── js/main.js          # GSAP interactions + fallbacks
├── assets/             # logo, favicon, product screenshots, partner & integration logos
├── images/             # UI icons (SVG)
├── vercel.json         # caching headers
└── screenshots/        # README preview
```

## 📝 Notes

- Built as a **portfolio piece** to demonstrate frontend engineering, motion design, and production polish.
- Content is a concept/teaser; not the official Youkti marketing copy.
