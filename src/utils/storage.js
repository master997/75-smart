import { format, differenceInDays, parseISO, subDays } from 'date-fns'

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

export function checkForReset(data) {
  if (!data || !data.challenge.startDate) return { needsReset: false }

  const today = new Date()
  const yesterday = subDays(today, 1)
  const dayBefore = subDays(today, 2)

  const yesterdayKey = format(yesterday, 'yyyy-MM-dd')
  const dayBeforeKey = format(dayBefore, 'yyyy-MM-dd')

  const yesterdayLog = data.dailyLogs[yesterdayKey]
  const dayBeforeLog = data.dailyLogs[dayBeforeKey]

  // Check if both yesterday and day before were incomplete
  const yesterdayIncomplete = !yesterdayLog || !yesterdayLog.allComplete
  const dayBeforeIncomplete = !dayBeforeLog || !dayBeforeLog.allComplete

  // Only trigger reset if we're past day 2 and both days were missed
  const currentDay = calculateCurrentDay(data.challenge.startDate)
  if (currentDay > 2 && yesterdayIncomplete && dayBeforeIncomplete) {
    return { needsReset: true, missedDays: 2 }
  }

  return { needsReset: false }
}

export function resetChallenge(data) {
  const newData = {
    ...data,
    challenge: {
      ...data.challenge,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      currentDay: 1,
      currentStreak: 0,
      totalResets: data.challenge.totalResets + 1,
    },
  }
  saveData(newData)
  return newData
}

export function updateRules(data, newRules) {
  const newData = {
    ...data,
    rules: newRules,
    challenge: {
      ...data.challenge,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      currentDay: 1,
      currentStreak: 0,
      totalResets: data.challenge.totalResets + 1,
    },
  }
  saveData(newData)
  return newData
}

export { DEFAULT_RULES }
