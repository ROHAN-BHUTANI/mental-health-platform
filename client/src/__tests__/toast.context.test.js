import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../context/ToastContext";

const Trigger = () => {
  const { toast } = useToast();

  return (
    <button type="button" onClick={() => toast("Saved successfully", "success", 3000)}>
      show-toast
    </button>
  );
};

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("shows and auto-dismisses toasts", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("show-toast"));
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3100);
    });

    expect(screen.queryByText("Saved successfully")).not.toBeInTheDocument();
  });
});