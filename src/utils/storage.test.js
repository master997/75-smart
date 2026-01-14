import { describe, it, expect, beforeEach, vi } from "vitest";
import { format, subDays } from "date-fns";
import {
  calculateCurrentDay,
  checkForReset,
  checkForWarning,
  initializeData,
  resetChallenge,
  getTodayKey,
  DEFAULT_RULES,
} from "./storage";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

const DATE_FORMAT = "yyyy-MM-dd";

describe("Storage Utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("getTodayKey", () => {
    it("returns today's date in yyyy-MM-dd format", () => {
      const result = getTodayKey();
      const expected = format(new Date(), DATE_FORMAT);
      expect(result).toBe(expected);
    });
  });

  describe("calculateCurrentDay", () => {
    it("returns 1 for today's start date", () => {
      const today = format(new Date(), DATE_FORMAT);
      expect(calculateCurrentDay(today)).toBe(1);
    });

    it("returns 2 for yesterday's start date", () => {
      const yesterday = format(subDays(new Date(), 1), DATE_FORMAT);
      expect(calculateCurrentDay(yesterday)).toBe(2);
    });

    it("returns 75 for 74 days ago start date", () => {
      const startDate = format(subDays(new Date(), 74), DATE_FORMAT);
      expect(calculateCurrentDay(startDate)).toBe(75);
    });

    it("returns 0 for null start date", () => {
      expect(calculateCurrentDay(null)).toBe(0);
    });
  });

  describe("initializeData", () => {
    it("creates data with default rules", () => {
      const data = initializeData();
      expect(data.rules).toEqual(DEFAULT_RULES);
      expect(data.rules).toHaveLength(6);
    });

    it("creates data with custom rules", () => {
      const customRules = [{ id: 1, text: "Custom rule" }];
      const data = initializeData(customRules);
      expect(data.rules).toEqual(customRules);
    });

    it("initializes challenge with correct defaults", () => {
      const data = initializeData();
      expect(data.challenge.currentStreak).toBe(0);
      expect(data.challenge.longestStreak).toBe(0);
      expect(data.challenge.totalResets).toBe(0);
      expect(data.challenge.failureFund).toBe(0);
    });

    it("starts with empty daily logs", () => {
      const data = initializeData();
      expect(data.dailyLogs).toEqual({});
    });

    it("saves to localStorage", () => {
      initializeData();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("checkForReset", () => {
    it("returns needsReset: false for null data", () => {
      const result = checkForReset(null);
      expect(result.needsReset).toBe(false);
    });

    it("returns needsReset: false when current day <= 2", () => {
      const data = {
        challenge: { startDate: format(new Date(), DATE_FORMAT) },
        dailyLogs: {},
      };
      expect(checkForReset(data).needsReset).toBe(false);
    });

    it("returns needsReset: false when yesterday was complete", () => {
      const yesterday = format(subDays(new Date(), 1), DATE_FORMAT);
      const data = {
        challenge: { startDate: format(subDays(new Date(), 5), DATE_FORMAT) },
        dailyLogs: {
          [yesterday]: { allComplete: true, completed: [] },
        },
      };
      expect(checkForReset(data).needsReset).toBe(false);
    });

    it("returns needsReset: true when both yesterday and day before were incomplete", () => {
      const yesterday = format(subDays(new Date(), 1), DATE_FORMAT);
      const dayBefore = format(subDays(new Date(), 2), DATE_FORMAT);
      const data = {
        challenge: { startDate: format(subDays(new Date(), 5), DATE_FORMAT) },
        dailyLogs: {
          [yesterday]: { allComplete: false, completed: [] },
          [dayBefore]: { allComplete: false, completed: [] },
        },
      };
      expect(checkForReset(data).needsReset).toBe(true);
      expect(checkForReset(data).missedDays).toBe(2);
    });

    it("returns needsReset: true when both days have no logs", () => {
      const data = {
        challenge: { startDate: format(subDays(new Date(), 5), DATE_FORMAT) },
        dailyLogs: {},
      };
      expect(checkForReset(data).needsReset).toBe(true);
    });
  });

  describe("checkForWarning", () => {
    it("returns showWarning: false for null data", () => {
      const result = checkForWarning(null);
      expect(result.showWarning).toBe(false);
    });

    it("returns showWarning: false on day 1", () => {
      const data = {
        challenge: { startDate: format(new Date(), DATE_FORMAT) },
        dailyLogs: {},
      };
      expect(checkForWarning(data).showWarning).toBe(false);
    });

    it("returns showWarning: true when yesterday was missed (day 2)", () => {
      const data = {
        challenge: { startDate: format(subDays(new Date(), 1), DATE_FORMAT) },
        dailyLogs: {},
      };
      expect(checkForWarning(data).showWarning).toBe(true);
    });

    it("returns showWarning: true when yesterday missed but day before complete", () => {
      const dayBefore = format(subDays(new Date(), 2), DATE_FORMAT);
      const data = {
        challenge: { startDate: format(subDays(new Date(), 5), DATE_FORMAT) },
        dailyLogs: {
          [dayBefore]: { allComplete: true, completed: [] },
        },
      };
      expect(checkForWarning(data).showWarning).toBe(true);
    });

    it("returns showWarning: false when yesterday was complete", () => {
      const yesterday = format(subDays(new Date(), 1), DATE_FORMAT);
      const data = {
        challenge: { startDate: format(subDays(new Date(), 5), DATE_FORMAT) },
        dailyLogs: {
          [yesterday]: { allComplete: true, completed: [] },
        },
      };
      expect(checkForWarning(data).showWarning).toBe(false);
    });
  });

  describe("resetChallenge", () => {
    it("increments totalResets", () => {
      const data = {
        rules: DEFAULT_RULES,
        challenge: {
          startDate: format(subDays(new Date(), 10), DATE_FORMAT),
          currentStreak: 5,
          longestStreak: 10,
          totalResets: 2,
        },
        dailyLogs: { someDay: { completed: [] } },
      };

      const result = resetChallenge(data);
      expect(result.challenge.totalResets).toBe(3);
    });

    it("resets currentStreak to 0", () => {
      const data = {
        rules: DEFAULT_RULES,
        challenge: {
          startDate: format(subDays(new Date(), 10), DATE_FORMAT),
          currentStreak: 5,
          longestStreak: 10,
          totalResets: 0,
        },
        dailyLogs: {},
      };

      const result = resetChallenge(data);
      expect(result.challenge.currentStreak).toBe(0);
    });

    it("clears daily logs", () => {
      const data = {
        rules: DEFAULT_RULES,
        challenge: {
          startDate: format(subDays(new Date(), 10), DATE_FORMAT),
          currentStreak: 5,
          longestStreak: 10,
          totalResets: 0,
        },
        dailyLogs: { "2026-01-01": { completed: [1, 2], allComplete: false } },
      };

      const result = resetChallenge(data);
      expect(result.dailyLogs).toEqual({});
    });

    it("preserves longestStreak", () => {
      const data = {
        rules: DEFAULT_RULES,
        challenge: {
          startDate: format(subDays(new Date(), 10), DATE_FORMAT),
          currentStreak: 5,
          longestStreak: 15,
          totalResets: 0,
        },
        dailyLogs: {},
      };

      const result = resetChallenge(data);
      expect(result.challenge.longestStreak).toBe(15);
    });

    it("sets start date to today", () => {
      const data = {
        rules: DEFAULT_RULES,
        challenge: {
          startDate: format(subDays(new Date(), 10), DATE_FORMAT),
          currentStreak: 5,
          longestStreak: 10,
          totalResets: 0,
        },
        dailyLogs: {},
      };

      const result = resetChallenge(data);
      expect(result.challenge.startDate).toBe(format(new Date(), DATE_FORMAT));
    });
  });
});
