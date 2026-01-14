import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { format, subDays } from "date-fns";
import CalendarTab from "./CalendarTab";
import { DEFAULT_RULES } from "../utils/storage";

const DATE_FORMAT = "yyyy-MM-dd";

const createMockData = (overrides = {}) => ({
  rules: DEFAULT_RULES,
  challenge: {
    startDate: format(subDays(new Date(), 5), DATE_FORMAT),
    currentDay: 6,
    currentStreak: 3,
    longestStreak: 5,
    totalResets: 0,
    failureFund: 0,
  },
  dailyLogs: {},
  ...overrides,
});

describe("CalendarTab", () => {
  describe("Calendar Rendering", () => {
    it("renders the calendar component", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      expect(screen.getByText("Your Progress")).toBeInTheDocument();
    });

    it("shows current month and year", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      const currentMonth = format(new Date(), "MMMM yyyy");
      expect(screen.getByText(currentMonth)).toBeInTheDocument();
    });

    it("renders day of week headers", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      expect(screen.getByText("Su")).toBeInTheDocument();
      expect(screen.getByText("Mo")).toBeInTheDocument();
      expect(screen.getByText("Tu")).toBeInTheDocument();
      expect(screen.getByText("We")).toBeInTheDocument();
      expect(screen.getByText("Th")).toBeInTheDocument();
      expect(screen.getByText("Fr")).toBeInTheDocument();
      expect(screen.getByText("Sa")).toBeInTheDocument();
    });

    it("renders legend", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      expect(screen.getByText("Legend")).toBeInTheDocument();
      expect(screen.getByText("Complete")).toBeInTheDocument();
      expect(screen.getByText("Incomplete")).toBeInTheDocument();
      expect(screen.getByText("Future")).toBeInTheDocument();
    });
  });

  describe("Month Navigation", () => {
    it("renders navigation arrows", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.getByText("→")).toBeInTheDocument();
    });

    it("navigates to previous month", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      const prevButton = screen.getByText("←");
      fireEvent.click(prevButton);

      const prevMonth = format(subDays(new Date(), 30), "MMMM yyyy");
      expect(screen.getByText(prevMonth)).toBeInTheDocument();
    });

    it("navigates to next month", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      fireEvent.click(screen.getByText("←"));
      fireEvent.click(screen.getByText("→"));

      const currentMonth = format(new Date(), "MMMM yyyy");
      expect(screen.getByText(currentMonth)).toBeInTheDocument();
    });
  });

  describe("Day Status Indicators", () => {
    it("shows checkmark for complete days", () => {
      const yesterday = format(subDays(new Date(), 1), DATE_FORMAT);
      const data = createMockData({
        dailyLogs: {
          [yesterday]: { completed: [1, 2, 3, 4, 5, 6], allComplete: true, reflection: "" },
        },
      });
      render(<CalendarTab data={data} />);

      const checkmarks = screen.getAllByText("✓");
      expect(checkmarks.length).toBeGreaterThanOrEqual(1);
    });

    it("shows X for incomplete past days", () => {
      const yesterday = format(subDays(new Date(), 1), DATE_FORMAT);
      const data = createMockData({
        dailyLogs: {
          [yesterday]: { completed: [1, 2], allComplete: false, reflection: "" },
        },
      });
      render(<CalendarTab data={data} />);

      const xMarks = screen.getAllByText("✗");
      expect(xMarks.length).toBeGreaterThanOrEqual(1);
    });

    it("renders clickable days in challenge period", () => {
      const data = createMockData();
      render(<CalendarTab data={data} />);

      // Calendar renders buttons for days
      const buttons = screen.getAllByRole("button");
      // Should have navigation (2) plus day buttons
      expect(buttons.length).toBeGreaterThan(2);
    });
  });
});
