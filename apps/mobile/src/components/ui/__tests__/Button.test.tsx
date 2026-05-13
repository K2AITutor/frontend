import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button", () => {
  it("renders a label and handles press", () => {
    const onPress = jest.fn();
    const screen = render(<Button label="Continue" onPress={onPress} />);

    fireEvent.press(screen.getByText("Continue"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
