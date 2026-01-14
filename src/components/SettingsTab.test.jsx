import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { format, subDays } from "date-fns";
import SettingsTab from "./SettingsTab";
import { DEFAULT_RULES } from "../utils/storage";

const DATE_FORMAT = "yyyy-MM-dd";

const createMockData = (overrides = {}) => ({
  rules: DEFAULT_RULES,
  challenge: {
    startDate: format(subDays(new Date(), 5), DATE_FORMAT),
    currentDay: 6,
    currentStreak: 3,
    longestStreak: 5,
    totalResets: 1,
    failureFund: 0,
  },
  dailyLogs: {},
  ...overrides,
});

describe("SettingsTab", () => {
  describe("Settings Cards Rendering", () => {
    it("renders all settings sections", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      expect(screen.getByText("Change Start Date")).toBeInTheDocument();
      expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("renders action buttons", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(3); // Edit Rules, Reset Challenge, Clear All Data
    });
  });

  describe("Change Start Date", () => {
    it("shows current start date in input", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const dateInput = screen.getByDisplayValue(data.challenge.startDate);
      expect(dateInput).toBeInTheDocument();
    });

    it("shows current day calculation", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      expect(screen.getByText("Day 6")).toBeInTheDocument();
    });

    it("opens confirmation modal when date changed", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const dateInput = screen.getByDisplayValue(data.challenge.startDate);
      fireEvent.change(dateInput, { target: { value: "2026-01-01" } });

      expect(screen.getByText("Change Start Date?")).toBeInTheDocument();
    });

    it("cancels date change when cancel clicked", () => {
      const setData = vi.fn();
      const data = createMockData();
      render(<SettingsTab data={data} setData={setData} />);

      const dateInput = screen.getByDisplayValue(data.challenge.startDate);
      fireEvent.change(dateInput, { target: { value: "2026-01-01" } });

      fireEvent.click(screen.getByText("Cancel"));

      expect(setData).not.toHaveBeenCalled();
      expect(screen.queryByText("Change Start Date?")).not.toBeInTheDocument();
    });
  });

  describe("Edit Rules", () => {
    it("opens edit rules modal when button clicked", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      const editButton = buttons.find(btn => btn.textContent === "Edit Rules");
      fireEvent.click(editButton);

      expect(screen.getByText("Modify your daily rules (3-8 rules)")).toBeInTheDocument();
    });

    it("shows current rules in edit modal", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      const editButton = buttons.find(btn => btn.textContent === "Edit Rules");
      fireEvent.click(editButton);

      DEFAULT_RULES.forEach((rule) => {
        expect(screen.getByDisplayValue(rule.text)).toBeInTheDocument();
      });
    });
  });

  describe("Reset Challenge", () => {
    it("opens confirmation modal when reset clicked", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      const resetButton = buttons.find(btn => btn.textContent === "Reset Challenge");
      fireEvent.click(resetButton);

      expect(screen.getByText("Reset Challenge?")).toBeInTheDocument();
    });

    it("cancels reset when cancel clicked", () => {
      const setData = vi.fn();
      const data = createMockData();
      render(<SettingsTab data={data} setData={setData} />);

      const buttons = screen.getAllByRole("button");
      const resetButton = buttons.find(btn => btn.textContent === "Reset Challenge");
      fireEvent.click(resetButton);
      fireEvent.click(screen.getByText("Cancel"));

      expect(setData).not.toHaveBeenCalled();
    });
  });

  describe("Clear All Data (Danger Zone)", () => {
    it("opens confirmation modal when clear all clicked", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      const clearButton = buttons.find(btn => btn.textContent === "Clear All Data");
      fireEvent.click(clearButton);

      expect(screen.getByText("Clear All Data?")).toBeInTheDocument();
    });

    it("shows warning about permanent deletion", () => {
      const data = createMockData();
      render(<SettingsTab data={data} setData={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      const clearButton = buttons.find(btn => btn.textContent === "Clear All Data");
      fireEvent.click(clearButton);

      expect(screen.getByText(/permanently delete ALL your data/)).toBeInTheDocument();
    });

    it("clears all data when confirmed", () => {
      const setData = vi.fn();
      const data = createMockData();
      render(<SettingsTab data={data} setData={setData} />);

      const buttons = screen.getAllByRole("button");
      const clearButton = buttons.find(btn => btn.textContent === "Clear All Data");
      fireEvent.click(clearButton);

      const deleteButton = screen.getByText("Delete Everything");
      fireEvent.click(deleteButton);

      expect(setData).toHaveBeenCalledWith(null);
    });
  });
});
