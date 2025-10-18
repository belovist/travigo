# Travigo — Collaborative Travel Planner

Travigo is a polished, privacy-conscious web prototype for collaborative trip planning. It provides a single, shared workspace where friends and teams can create itineraries, add bookings and activities, track budgets, and coordinate tasks — all in a clean, responsive UI.

Status: Prototype (static front-end)

Hosted demo: https://belovist.github.io/travigo/

## Key Features

- Shared trip workspaces with itinerary views
- Create and manage trips from the dashboard
- Trip detail pages with bookings, timeline, and notes
- Local storage persistence for quick prototyping and demos
- Responsive, Apple-inspired dark UI and accessible forms

## Project Structure

```
.
├── index.html        # Landing + signup call-to-action
├── login.html        # Login form and validation
├── dashboard.html    # Trip listing, create trip modal
├── trip-detail.html  # Trip timeline, bookings, budgets
├── about.html        # Team and contact section
├── css/
│   └── style.css     # Global styling, responsive rules
├── js/
│   └── main.js       # UI logic: nav toggle, auth mock, trip render
└── images/           # Illustrations & profile images
```

## Quick Start

1. Clone or download the repository.
2. Open `index.html` in a browser for a local preview.

Optional: serve with a simple static server for consistent behavior:

```powershell
# From project root (Windows PowerShell)
python -m http.server 8080; # then open http://localhost:8080
```

## Usage Notes

- Data is saved to `localStorage`; clear it to reset demo content.
- The prototype is front-end only — there is no backend or user auth yet.
- Scripts and assets must remain linked (see `index.html` head & scripts) for full functionality.

## Roadmap (ideas)

- Integrate a backend for persistent multi-device sync
- Add user accounts and invite flows
- Expand budget and expense tracking
- Improve accessibility and i18n

## License

MIT — see LICENSE (add if applicable)

---

If you’d like, tell me the hosted URL and I’ll insert it into the README.
