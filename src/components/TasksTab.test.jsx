import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { format } from "date-fns";
import TasksTab from "./TasksTab";
import { DEFAULT_RULES } from "../utils/storage";

// Mock quotes.json
vi.mock("../../quotes.json", () => ({
  default: [{ text: "Test quote", author: "Test Author" }],
}));

const DATE_FORMAT = "yyyy-MM-dd";
const todayKey = format(new Date(), DATE_FORMAT);

const createMockData = (overrides = {}) => ({
  rules: DEFAULT_RULES,
  challenge: {
    startDate: todayKey,
    currentDay: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalResets: 0,
    failureFund: 0,
  },
  dailyLogs: {},
  ...overrides,
});

describe("TasksTab", () => {
  describe("Onboarding", () => {
    it("renders onboarding when data is null", () => {
      render(<TasksTab data={null} setData={vi.fn()} onStartChallenge={vi.fn()} />);

      expect(screen.getByText(/define 3-8 daily rules/i)).toBeInTheDocument();
      expect(screen.getByText("Start Challenge")).toBeInTheDocument();
    });

    it("shows default rules in onboarding", () => {
      render(<TasksTab data={null} setData={vi.fn()} onStartChallenge={vi.fn()} />);

      expect(screen.getByDisplayValue(/Deep Learning Session 1/)).toBeInTheDocument();
    });

    it("calls onStartChallenge when starting", () => {
      const onStartChallenge = vi.fn();
      render(<TasksTab data={null} setData={vi.fn()} onStartChallenge={onStartChallenge} />);

      fireEvent.click(screen.getByText("Start Challenge"));

      expect(onStartChallenge).toHaveBeenCalled();
    });
  });

  describe("Task List", () => {
    it("renders all rules as tasks", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      DEFAULT_RULES.forEach((rule) => {
        expect(screen.getByText(rule.text)).toBeInTheDocument();
      });
    });

    it("renders checkboxes for each task", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(DEFAULT_RULES.length);
    });

    it("shows unchecked checkboxes initially", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it("shows checked state for completed tasks", () => {
      const data = createMockData({
        dailyLogs: {
          [todayKey]: { completed: [1, 2], allComplete: false, reflection: "" },
        },
      });
      render(<TasksTab data={data} setData={vi.fn()} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });
  });

  describe("Task Toggle", () => {
    it("calls setData when checkbox is clicked", () => {
      const setData = vi.fn();
      const data = createMockData();
      render(<TasksTab data={data} setData={setData} />);

      const checkbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(checkbox);

      expect(setData).toHaveBeenCalled();
    });

    it("adds task to completed when checked", () => {
      const setData = vi.fn();
      const data = createMockData();
      render(<TasksTab data={data} setData={setData} />);

      const checkbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(checkbox);

      const newData = setData.mock.calls[0][0];
      expect(newData.dailyLogs[todayKey].completed).toContain(1);
    });

    it("removes task from completed when unchecked", () => {
      const setData = vi.fn();
      const data = createMockData({
        dailyLogs: {
          [todayKey]: { completed: [1], allComplete: false, reflection: "" },
        },
      });
      render(<TasksTab data={data} setData={setData} />);

      const checkbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(checkbox);

      const newData = setData.mock.calls[0][0];
      expect(newData.dailyLogs[todayKey].completed).not.toContain(1);
    });

    it("sets allComplete true when all tasks checked", () => {
      const setData = vi.fn();
      const data = createMockData({
        dailyLogs: {
          [todayKey]: { completed: [1, 2, 3, 4, 5], allComplete: false, reflection: "" },
        },
      });
      render(<TasksTab data={data} setData={setData} />);

      // Click the last unchecked task (id: 6)
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[5]);

      const newData = setData.mock.calls[0][0];
      expect(newData.dailyLogs[todayKey].allComplete).toBe(true);
    });

    it("increments streak when all tasks completed", () => {
      const setData = vi.fn();
      const data = createMockData({
        dailyLogs: {
          [todayKey]: { completed: [1, 2, 3, 4, 5], allComplete: false, reflection: "" },
        },
      });
      render(<TasksTab data={data} setData={setData} />);

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[5]);

      const newData = setData.mock.calls[0][0];
      expect(newData.challenge.currentStreak).toBe(1);
    });
  });

  describe("Completion Message", () => {
    it("shows completion message when all tasks done", () => {
      const data = createMockData({
        dailyLogs: {
          [todayKey]: { completed: [1, 2, 3, 4, 5, 6], allComplete: true, reflection: "" },
        },
      });
      render(<TasksTab data={data} setData={vi.fn()} />);

      expect(screen.getByText("All tasks complete")).toBeInTheDocument();
    });

    it("does not show completion message when tasks incomplete", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      expect(screen.queryByText("All tasks complete")).not.toBeInTheDocument();
    });
  });

  describe("Quote Display", () => {
    it("displays a quote", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      expect(screen.getByText(/Test quote/)).toBeInTheDocument();
      expect(screen.getByText(/Test Author/)).toBeInTheDocument();
    });
  });

  describe("Reflection", () => {
    it("renders reflection textarea", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      expect(screen.getByPlaceholderText("How did today go?")).toBeInTheDocument();
    });

    it("shows existing reflection text", () => {
      const data = createMockData({
        dailyLogs: {
          [todayKey]: { completed: [], allComplete: false, reflection: "Great day!" },
        },
      });
      render(<TasksTab data={data} setData={vi.fn()} />);

      expect(screen.getByDisplayValue("Great day!")).toBeInTheDocument();
    });

    it("calls setData when reflection changes", () => {
      const setData = vi.fn();
      const data = createMockData();
      render(<TasksTab data={data} setData={setData} />);

      const textarea = screen.getByPlaceholderText("How did today go?");
      fireEvent.change(textarea, { target: { value: "New reflection" } });

      expect(setData).toHaveBeenCalled();
      const newData = setData.mock.calls[0][0];
      expect(newData.dailyLogs[todayKey].reflection).toBe("New reflection");
    });
  });

  describe("Warning Banner", () => {
    it("does not show warning on day 1", () => {
      const data = createMockData();
      render(<TasksTab data={data} setData={vi.fn()} />);

      expect(screen.queryByText(/You missed yesterday/)).not.toBeInTheDocument();
    });
  });
});
