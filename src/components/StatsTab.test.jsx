import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { format, subDays } from "date-fns";
import StatsTab from "./StatsTab";
import { DEFAULT_RULES } from "../utils/storage";

const DATE_FORMAT = "yyyy-MM-dd";

const createMockData = (overrides = {}) => ({
  rules: DEFAULT_RULES,
  challenge: {
    startDate: format(subDays(new Date(), 10), DATE_FORMAT),
    currentDay: 11,
    currentStreak: 5,
    longestStreak: 8,
    totalResets: 2,
    failureFund: 0,
  },
  dailyLogs: {},
  ...overrides,
});

describe("StatsTab", () => {
  describe("Overview Stats Cards", () => {
    it("renders current day", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      expect(screen.getByText("Current Day")).toBeInTheDocument();
      expect(screen.getByText("11")).toBeInTheDocument();
    });

    it("caps current day at 75", () => {
      const data = createMockData({
        challenge: {
          ...createMockData().challenge,
          startDate: format(subDays(new Date(), 80), DATE_FORMAT),
        },
      });
      render(<StatsTab data={data} />);

      expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("renders current streak", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      expect(screen.getByText("Current Streak")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders longest streak", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      expect(screen.getByText("Longest Streak")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
    });

    it("renders total resets", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      expect(screen.getByText("Total Resets")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Completion Rate", () => {
    it("shows 0% when no days logged", () => {
      const data = createMockData({ dailyLogs: {} });
      render(<StatsTab data={data} />);

      expect(screen.getByText("Completion Rate")).toBeInTheDocument();
      // Find the 0% in the completion rate section
      const completionSection = screen.getByText("Completion Rate").closest("div");
      expect(completionSection).toHaveTextContent("0%");
    });

    it("calculates completion rate correctly", () => {
      const data = createMockData({
        dailyLogs: {
          "2026-01-10": { completed: [1, 2, 3, 4, 5, 6], allComplete: true, reflection: "" },
          "2026-01-11": { completed: [1, 2, 3, 4, 5, 6], allComplete: true, reflection: "" },
          "2026-01-12": { completed: [1, 2], allComplete: false, reflection: "" },
          "2026-01-13": { completed: [1], allComplete: false, reflection: "" },
        },
      });
      render(<StatsTab data={data} />);

      // 2 complete out of 4 logged = 50%
      expect(screen.getByText(/2 complete days out of 4 logged/)).toBeInTheDocument();
    });
  });

  describe("Task Breakdown", () => {
    it("renders task breakdown section", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      expect(screen.getByText("Task Breakdown")).toBeInTheDocument();
    });

    it("shows all rules in breakdown", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      DEFAULT_RULES.forEach((rule) => {
        expect(screen.getByText(rule.text)).toBeInTheDocument();
      });
    });

    it("calculates per-rule percentage", () => {
      const data = createMockData({
        dailyLogs: {
          "2026-01-10": { completed: [1, 2], allComplete: false, reflection: "" },
          "2026-01-11": { completed: [1], allComplete: false, reflection: "" },
        },
      });
      render(<StatsTab data={data} />);

      // Rule 1 completed 2/2 times = 100%
      // Rule 2 completed 1/2 times = 50%
      // Check that percentages exist (multiple 50% and 0% values expected)
      const allText = document.body.textContent;
      expect(allText).toContain("100%");
      expect(allText).toContain("50%");
    });
  });

  describe("Export Feature", () => {
    it("renders export button", () => {
      const data = createMockData();
      render(<StatsTab data={data} />);

      expect(screen.getByText("Export Data")).toBeInTheDocument();
    });

    it("creates a download when clicked", () => {
      const data = createMockData();

      // Mock URL methods
      const mockUrl = "blob:test";
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = vi.fn(() => mockUrl);
      URL.revokeObjectURL = vi.fn();

      // Track if anchor click was called
      let clickCalled = false;
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        const el = originalCreateElement(tag);
        if (tag === "a") {
          el.click = () => { clickCalled = true; };
        }
        return el;
      });

      render(<StatsTab data={data} />);
      fireEvent.click(screen.getByText("Export Data"));

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(clickCalled).toBe(true);

      // Cleanup
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      vi.restoreAllMocks();
    });
  });
});
