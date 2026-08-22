# 🎬 Cinovo — Free Movie & TV Streaming Site

A fully animated, Netflix-style movie and TV show streaming website built with **React + Vite**, powered by the **TMDB API**.

> 🎓 **University Project** — For educational/personal use only.

---

## ✨ Features

- 🏠 **Home** — Animated hero banner (auto-rotating) + horizontal content rows
- 🎬 **Movies** — Browse with genre & sort filters, paginated grid
- 📺 **TV Shows** — Full season/episode selector, genre filters
- 🔥 **Trending** — Today & This Week toggle
- 🔍 **Live Search** — Instant dropdown suggestions as you type
- 🎥 **Watch Modal** — 3 streaming servers with smooth player
- 💫 **Framer Motion** — Page transitions, card hover effects, staggered animations
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop
- ⚡ **Skeleton Loaders** — Beautiful loading states throughout

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Styling | CSS Modules |
| Icons | Lucide React |
| Movie Data | TMDB API (free) |
| HTTP | Axios |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/AwaisShahbir/Cinovo.git
cd Cinovo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up your TMDB API key
Create a `.env` file in the root directory:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```
Get a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api)

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎥 Streaming Servers

The player uses three embed providers as fallbacks:
- **Server 1** — vidlink.pro
- **Server 2** — vidsrc.to  
- **Server 3** — 2embed.cc

If one server doesn't load a title, try switching servers.

---

## 📁 Project Structure

```
src/
├── api/
│   └── tmdb.js          # TMDB API + stream URL helpers
├── components/
│   ├── Navbar.jsx        # Sticky nav with live search
│   ├── HeroBanner.jsx    # Auto-rotating hero carousel
│   ├── MovieCard.jsx     # Animated card with hover effects
│   ├── ContentRow.jsx    # Horizontal scrollable row
│   ├── ContentGrid.jsx   # Responsive grid layout
│   └── WatchModal.jsx    # Watch modal with player & episode picker
├── pages/
│   ├── Home.jsx
│   ├── Movies.jsx
│   ├── TVShows.jsx
│   ├── Trending.jsx
│   └── SearchResults.jsx
├── hooks/
│   └── useDebounce.js
└── styles/
    └── globals.css
```

---

## ⚠️ Disclaimer

This project is for **educational purposes only**. Movie content is provided by third-party embed services. No content is hosted on this project.

---

*Made with ❤️ for a university project*
