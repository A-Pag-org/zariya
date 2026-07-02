import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL auto-cleanup relies on global afterEach; with `globals: false` we wire
// it explicitly so each test starts from an empty document.
afterEach(cleanup);
