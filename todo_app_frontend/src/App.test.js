import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

test("user can add a todo and see it in the list", async () => {
  render(<App />);
  const input = screen.getByLabelText(/add a task/i);
  await userEvent.type(input, "Buy milk");
  await userEvent.click(screen.getByRole("button", { name: /add/i }));

  expect(screen.getByText("Buy milk")).toBeInTheDocument();
});

test("user can toggle completion and filter completed", async () => {
  render(<App />);
  const input = screen.getByLabelText(/add a task/i);
  await userEvent.type(input, "Task 1");
  await userEvent.click(screen.getByRole("button", { name: /add/i }));

  // Toggle completion
  await userEvent.click(screen.getByRole("button", { name: /mark as complete/i }));

  // Switch to Completed filter
  await userEvent.click(screen.getByRole("tab", { name: /completed/i }));

  expect(screen.getByText("Task 1")).toBeInTheDocument();
});
