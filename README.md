# HACKDAY 2.0 — Interactive Front-End Website

A playful, responsive, single-page event website for **HACKDAY 2.0**, organized by **DECODEP** (*"DECODE · DEVELOP · DOMINATE"*). Built purely with **HTML5, CSS3, and Vanilla JavaScript** (incorporating Three.js 3D hero stage, Web Audio cartoon sound synthesizer, 3D flip countdown, interactive workflow checklist, and webinar lock states).

---

## ⚡ Quick Start

No Python, Node.js, or backend server installation required!

### Option 1: Direct Double Click
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Static Server (Recommended)
Using any simple static server provides the smoothest Web Audio and module experience:

- **VS Code / IDE**: Right-click `index.html` -> **"Open with Live Server"**
- **Node.js (npx)**:
  ```bash
  npx serve .
  ```
- **Python (Optional one-liner)**:
  ```bash
  python -m http.server 8000
  ```

---

## 🛠️ Configuration & Customization

All event settings are located in [`js/main.js`](js/main.js) in the `EVENT_CONFIG` object:

```javascript
const EVENT_CONFIG = {
  // Toggle to true to unlock the webinar cards and reveal live session links:
  webinar_unlocked: false,
  webinar_link: 'https://meet.google.com/decode-hackday-live',
  unstop_url: 'https://unstop.com/o/zTIUx2V?lb=CJ',
  unstop_competition_id: '1773120',
  event_date: '2026-12-19T09:00:00',
  default_participant_count: 426
};
```

### 1. How to Change the Unstop Registration URL
- In `index.html`: Update the `href` attribute on `#hero-register-btn` and the register banner CTA.
- In `js/main.js`: Update `unstop_url` in `EVENT_CONFIG`.

### 2. How to Lock / Unlock the Free Webinar
- Open `js/main.js`.
- Set `webinar_unlocked: true`.
- Update `webinar_link` with your Google Meet, Zoom, or YouTube Live stream URL.
- Refresh `index.html` — the cards will unlock and display the **"Join Webinar Live"** button.

---

## 📂 Project Structure

```
HD_2.0/
 ├─ index.html           # Main semantic HTML5 single-page website
 ├─ css/
 │   └─ style.css        # Shinchan-inspired cartoon design system, 3D tilt, responsive layouts
 ├─ js/
 │   └─ main.js          # Three.js 3D canvas, Web Audio sound effects, countdown, confetti
 ├─ img/
 │   ├─ logo.png         # Silver stylized "P" logo
 │   ├─ official_poster.jpg
 │   ├─ poster1.jpg      # Comic coding night art
 │   ├─ poster2.jpg      # Comic celebration art
 │   ├─ site_bg.jpg      # Ambient background texture
 │   ├─ site_bg_full.jpg
 │   └─ props/
 │       ├─ chocobi.png  # Chocobi snack prop
 │       └─ shiro.png    # Shiro puppy running preloader mascot
 └─ README.md            # Project documentation
```

---

## 🎨 Event Details

- **Organizer**: DECODEP (*"DECODE · DEVELOP · DOMINATE"*)
- **Event**: HACKDAY 2.0
- **Taglines**: *"SAME MADNESS, BIGGER IDEAS!"* & *"GOOD IDEAS HAPPEN HERE!"*
- **Format**: 24 HOURS HACKATHON
- **Dates**: December 19 – 20, 2026
- **Mode**: ONLINE ONLY
- **Cost**: FREE REGISTRATION
