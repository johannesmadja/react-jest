import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("Should be true", () => {
    expect(true).toBe(true);
})

test("affiche le titre et incrémente le compteur au clic", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Get started" })).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /count is 0/i });
    fireEvent.click(button);

    expect(button).toHaveTextContent("Count is 1");
})
