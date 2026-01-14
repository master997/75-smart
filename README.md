# 75 Smart

A minimalist 75-day challenge tracker inspired by [75sm.art](https://75sm.art/).

## Features

- **Daily Task Tracking** - Check off your custom rules each day
- **Calendar View** - Visual progress with ✓/✗ symbols for each day
- **Auto-Reset** - Challenge resets if you miss 2 consecutive days
- **Warning System** - Get warned after missing 1 day
- **Flexible Rules** - Create 3-8 custom daily rules
- **Local Storage** - All data saved in your browser (no account needed)
- **Dark Minimalist UI** - Clean, distraction-free interface

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How It Works

1. Set your start date and customize your daily rules
2. Complete all tasks each day to maintain your streak
3. Miss 1 day? You get a warning
4. Miss 2 consecutive days? Challenge resets to Day 1
5. Complete all 75 days to win!

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- date-fns
- localStorage for persistence

## Deployment

Build and deploy to any static hosting:

```bash
npm run build
```

The `dist/` folder can be deployed to Vercel, Netlify, GitHub Pages, etc.
