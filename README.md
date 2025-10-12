# TravelPlanner Prototype v2

An Apple-inspired travel planning prototype with polished layouts, responsive Bootstrap grids, and localStorage-powered interactivity. Users can log in, create trips, view details, and meet the team—all inside a calm, white-on-soft-gray aesthetic.

## ✨ What’s New in v2

- **Refined landing page** with centered hero, balanced imagery, and scroll-triggered reveals.
- **Functional login** that validates credentials, stores the user email locally, and personalises the dashboard greeting.
- **Trip dashboard** featuring a persistent trip library, inline delete actions, and a Bootstrap modal for creating new itineraries.
- **Dynamic trip details** that render the selected journey’s data (members, duration, notes) on demand.
- **Team & contact revamp** with placeholder profile cards and a validated contact form ready for future integrations.

## 🗂️ Project Structure

```
.
├── index.html        # Landing + centered sign-up experience
├── login.html        # Functional login with validation + redirect
├── dashboard.html    # Trip management grid and modal workflow
├── trip.html         # Dynamic trip detail view
├── about.html        # Team showcase and contact form
├── css
│   └── style.css     # Global system styling + animations
├── js
│   └── main.js       # Login, trip CRUD, view routing, nav toggle
└── images
    └── profile-placeholder.svg  # Team card placeholder art
```

## 🚀 Getting Started

Open `index.html` (or any page) directly in your browser—everything runs locally.

### Optional Local Preview

```powershell
# From the project root
docker run --rm -it -v "${PWD}:\usr\share\nginx\html" -p 8080:80 nginx
```

Visit `http://localhost:8080` to explore the experience.

## 💡 Prototype Flow

1. Land on the hero page, explore the visuals, and scroll to reveal content.
2. Head to **Login**, enter an email + password, and you’ll be redirected to the dashboard.
3. Use **Add Trip** to create itineraries; they persist in localStorage and update the trip counter.
4. Click **View itinerary →** on any trip to jump into the trip detail page populated with your data.
5. Visit **About** to see the team placeholders and reach out through the validated contact form.

## 🧪 Notes

- Data is stored locally in your browser via `localStorage`; clear it to reset the experience.
- Scroll reveal animations and Bootstrap modals rely on `js/main.js` and `bootstrap.bundle.js`—keep those scripts included.
- Replace `images/profile-placeholder.svg` with real portraits when you’re ready.

## 🛠️ Next Ideas

- Connect the login to a real auth flow and backend API.
- Sync trip data with a cloud store for cross-device planning.
- Expand the dashboard with filters, budgets, and document uploads.
