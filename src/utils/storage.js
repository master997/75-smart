import { format, differenceInDays, parseISO } from 'date-fns'

const STORAGE_KEY = '75smartrules'

const DEFAULT_RULES = [
  { id: 1, text: 'Deep Learning Session 1 (30-45 min)' },
  { id: 2, text: 'Deep Learning Session 2 (30-45 min)' },
  { id: 3, text: '15 min Meta-Learning' },
  { id: 4, text: 'Create 1 Intellectual Output' },
  { id: 5, text: 'Read 10 Pages Non-Fiction' },
  { id: 6, text: 'No Low-Value Dopamine Before 8pm' },
]

function getDefaultData() {
  return {
    rules: [],
    challenge: {
      startDate: null,
      currentDay: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalResets: 0,
      failureFund: 0,
    },
    dailyLogs: {},
  }
}

export function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load data:', error)
    return null
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save data:', error)
    return false
  }
}

export function initializeData(rules = DEFAULT_RULES, startDate = new Date()) {
  const data = {
    rules: rules,
    challenge: {
      startDate: format(startDate, 'yyyy-MM-dd'),
      currentDay: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalResets: 0,
      failureFund: 0,
    },
    dailyLogs: {},
  }
  saveData(data)
  return data
}

export function getTodayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function calculateCurrentDay(startDate) {
  if (!startDate) return 0
  const start = parseISO(startDate)
  const today = new Date()
  return differenceInDays(today, start) + 1
}

export function isStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

export { DEFAULT_RULES }
