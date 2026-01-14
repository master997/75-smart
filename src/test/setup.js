import "@testing-library/jest-dom";
import { vi } from "vitest";

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
    clear: () => {
      store = {};
    },
    _getStore: () => store,
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
