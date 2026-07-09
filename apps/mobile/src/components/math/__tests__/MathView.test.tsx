import React from "react";
import { render } from "@testing-library/react-native";
import { MathView } from "../MathView";

describe("MathView", () => {
  it("renders plain text without a webview", () => {
    const screen = render(<MathView value="No maths here" />);

    expect(screen.getByText("No maths here")).toBeTruthy();
  });

  it("uses a webview for LaTeX", () => {
    const screen = render(<MathView value="Solve $x^2 = 4$" />);

    expect(screen.getByTestId("webview")).toBeTruthy();
  });
});
