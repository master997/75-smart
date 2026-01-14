import { format, differenceInDays, parseISO, subDays } from "date-fns";
import { supabase } from "./supabase";

const STORAGE_KEY = "75smartrules";
const DATE_FORMAT = "yyyy-MM-dd";

export const DEFAULT_RULES = [
  { id: 1, text: "Deep Learning Session 1 (30-45 min)" },
  { id: 2, text: "Deep Learning Session 2 (30-45 min)" },
  { id: 3, text: "15 min Meta-Learning" },
  { id: 4, text: "Create 1 Intellectual Output" },
  { id: 5, text: "Read 10 Pages Non-Fiction" },
  { id: 6, text: "No Low-Value Dopamine Before 8pm" },
];

// Helper to format date consistently
const formatDate = (date) => {
  if (!date) return format(new Date(), DATE_FORMAT);
  if (typeof date === "string") return date;
  return format(date, DATE_FORMAT);
};

// Helper to get day log for a specific date
const getDayLog = (data, date) => {
  const key = format(date, DATE_FORMAT);
  return data.dailyLogs[key];
};

// ============================================
// LOCAL STORAGE OPERATIONS
// ============================================

export const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

export const isStorageAvailable = () => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// CLOUD STORAGE OPERATIONS (Supabase)
// ============================================

export const loadCloudData = async (userId) => {
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from("challenges")
      .select("data")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading cloud data:", error);
      return null;
    }

    return data?.data || null;
  } catch {
    return null;
  }
};

export const saveCloudData = async (userId, challengeData) => {
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase
      .from("challenges")
      .upsert(
        {
          user_id: userId,
          data: challengeData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Error saving cloud data:", error);
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const migrateToCloud = async (userId) => {
  if (!supabase || !userId) return { success: false, error: "Not configured" };

  try {
    // Get local data
    const localData = loadData();
    if (!localData) {
      return { success: true, message: "No local data to migrate" };
    }

    // Check if cloud already has data
    const cloudData = await loadCloudData(userId);
    if (cloudData) {
      return { 
        success: false, 
        error: "Cloud already has data. Clear cloud data first or choose to keep it." 
      };
    }

    // Save local data to cloud
    const saved = await saveCloudData(userId, localData);
    if (!saved) {
      return { success: false, error: "Failed to save to cloud" };
    }

    // Optionally clear local data after migration
    // clearAllData();

    return { success: true, message: "Data migrated to cloud" };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const clearCloudData = async (userId) => {
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing cloud data:", error);
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// ============================================
// DATE UTILITIES
// ============================================

export const getTodayKey = () => format(new Date(), DATE_FORMAT);

export const calculateCurrentDay = (startDate) => {
  if (!startDate) return 0;
  return differenceInDays(new Date(), parseISO(startDate)) + 1;
};

// ============================================
// CHALLENGE OPERATIONS
// ============================================

export const initializeData = (rules = DEFAULT_RULES, startDate = null) => {
  const data = {
    rules,
    challenge: {
      startDate: formatDate(startDate),
      currentDay: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalResets: 0,
      failureFund: 0,
    },
    dailyLogs: {},
  };
  saveData(data);
  return data;
};

export const checkForReset = (data) => {
  if (!data?.challenge?.startDate) return { needsReset: false };

  const today = new Date();
  const currentDay = calculateCurrentDay(data.challenge.startDate);

  if (currentDay <= 2) return { needsReset: false };

  const yesterdayLog = getDayLog(data, subDays(today, 1));
  const dayBeforeLog = getDayLog(data, subDays(today, 2));

  const bothDaysMissed =
    (!yesterdayLog || !yesterdayLog.allComplete) &&
    (!dayBeforeLog || !dayBeforeLog.allComplete);

  return bothDaysMissed
    ? { needsReset: true, missedDays: 2 }
    : { needsReset: false };
};

export const checkForWarning = (data) => {
  if (!data?.challenge?.startDate) return { showWarning: false };

  const today = new Date();
  const currentDay = calculateCurrentDay(data.challenge.startDate);

  if (currentDay <= 1) return { showWarning: false };

  const yesterdayLog = getDayLog(data, subDays(today, 1));
  const dayBeforeLog = getDayLog(data, subDays(today, 2));

  const yesterdayIncomplete = !yesterdayLog || !yesterdayLog.allComplete;
  const dayBeforeComplete = dayBeforeLog?.allComplete === true;

  if (yesterdayIncomplete && (currentDay <= 2 || dayBeforeComplete)) {
    return { showWarning: true, missedYesterday: true };
  }

  return { showWarning: false };
};

export const resetChallenge = (data) => {
  const newData = {
    ...data,
    challenge: {
      ...data.challenge,
      startDate: formatDate(),
      currentDay: 1,
      currentStreak: 0,
      totalResets: data.challenge.totalResets + 1,
    },
  };
  saveData(newData);
  return newData;
};

export const updateStartDate = (data, newDate) => {
  const newData = {
    ...data,
    challenge: {
      ...data.challenge,
      startDate: formatDate(newDate),
    },
  };
  saveData(newData);
  return newData;
};

export const updateRules = (data, newRules) => {
  const newData = {
    ...data,
    rules: newRules,
    challenge: {
      ...data.challenge,
      startDate: formatDate(),
      currentDay: 1,
      currentStreak: 0,
      totalResets: data.challenge.totalResets + 1,
    },
  };
  saveData(newData);
  return newData;
};

export const updateRulesWithoutReset = (data, newRules) => {
  const newData = { ...data, rules: newRules };
  saveData(newData);
  return newData;
};
