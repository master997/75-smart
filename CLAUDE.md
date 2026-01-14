# 75 Smart Rules - Habit Tracker

## Project Overview

Personal habit accountability web app. Users create 3-8 custom rules for a 75-day challenge. Mohammed's 6 "Smart Rules" are the default template targeting knowledge workers.

## Tech Stack

- React 18 + Vite (fast dev server)
- Tailwind CSS (utility-first styling)
- localStorage only (no backend, no auth)
- date-fns for date handling
- Deploy to Vercel (static hosting)

## Architecture Decisions

### Data Storage

All data in single localStorage key: "75smartrules"

```javascript
{
  rules: [{id: number, text: string}],
  challenge: {startDate, currentDay, currentStreak, longestStreak, totalResets, failureFund},
  dailyLogs: {
    "2026-01-15": {completed: [ruleIds], allComplete: boolean, reflection: string}
  }
}
```

### UI Layout

3-tab system (NOT routes, just state):

- Tasks tab (default) - daily check-in
- Calendar tab - monthly view (not heatmap)
- Stats tab - analytics breakdown

Top tabs (web style), NOT bottom tabs.

### Auto-Save Behavior

IMPORTANT: No "Save" button exists. Every checkbox onChange immediately:

1. Updates React state
2. Saves to localStorage
3. Recalculates streak
4. Checks for 2-day failure

This is critical - users expect instant persistence.

### Streak Logic

- Complete day = ALL rules checked
- Incomplete day = any rule unchecked
- Miss 1 day → continue (no penalty)
- Miss 2 consecutive days → RESET to Day 0 (show modal)

Why: This creates accountability without being too punishing.

### Edit Rules Behavior

Users can edit rules anytime BUT it resets challenge to Day 0.
Why: Allows flexibility but maintains commitment integrity.

## Component Structure

```
App.jsx (manages tab state, loads/saves localStorage)
├── Header (day counter, streak display)
├── TabNavigation (switches between 3 tabs)
├── TasksTab
│   ├── QuoteDisplay (random from quotes.json)
│   ├── TaskChecklist (maps over rules)
│   ├── EditRulesModal (with reset warning)
│   └── ReflectionForm (optional textarea)
├── CalendarTab
│   ├── MonthSelector (← Jan 2026 →)
│   ├── CalendarGrid (traditional monthly)
│   └── DayDetailModal (click day → see tasks)
└── StatsTab
    ├── StatsCards (current day, streak, resets)
    ├── TaskBreakdown (per-rule completion %)
    └── ExportButton (download JSON)
```

## Default Rules (Template)

1. Deep Learning Session 1 (30-45 min)
2. Deep Learning Session 2 (30-45 min)
3. 15 min Meta-Learning
4. Create 1 Intellectual Output
5. Read 10 Pages Non-Fiction
6. No Low-Value Dopamine Before 8pm

These appear in onboarding as suggested template.

## Key Development Notes

### localStorage Utilities

Create `src/utils/storage.js` with:

- `loadData()` - loads from localStorage, returns default structure if empty
- `saveData(data)` - saves entire state object
- `initializeData(rules, startDate)` - creates new challenge

Why separate utilities: We'll reuse these across components.

### Date Handling

Use date-fns for all date operations. Format: "YYYY-MM-DD" for consistency.
Never use Date.toString() - it's locale-dependent and breaks comparisons.

### Responsive Design

Mobile-first. Users will check in at night on phones (9pm typical).
Ensure checkboxes are large enough for thumb taps (min 44px touch target).

### Quote System

Load quotes.json once on app mount, store in state.
Pick random quote on each visit (Math.random(), not day-based).
~50-100 motivational quotes about habits/discipline/learning.

### Error Handling

If localStorage is blocked (private browsing), show error banner:
"This app requires localStorage. Please use regular browsing mode."

Don't let app crash silently.

## Build Phases

### Phase 1: Core (DO THIS FIRST)

- Vite + React + Tailwind setup
- localStorage utilities
- Basic 3-tab layout with state switching
- TasksTab with checkboxes
- Auto-save on checkbox change
- Streak calculation logic

### Phase 2: Features

- Onboarding flow (first visit)
- Edit rules modal
- Quote display
- 2-day reset detection + modal
- Reflection textarea

### Phase 3: Calendar & Stats

- Calendar component (monthly grid)
- Day detail modal
- Stats calculations
- Task breakdown percentages
- Export JSON feature

### Phase 4: Polish

- Responsive design
- Animations (subtle)
- Victory screen (Day 75)
- PWA setup (manifest.json)

## Common Pitfalls to Avoid

- Don't use React Router (we don't need routing)
- Don't make rules a separate page (edit modal is fine)
- Don't add a save button (auto-save only)
- Don't use complex state management (useState is enough)
- Don't fetch external data (everything is local)

## Development Commands

```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install date-fns
npm run dev
```

## Testing Strategy

Test streak logic manually:

1. Complete all tasks → verify streak increments
2. Miss 1 day → verify continues
3. Miss 2 consecutive days → verify reset modal appears
4. Edit rules → verify reset to Day 0
