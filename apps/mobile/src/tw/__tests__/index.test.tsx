import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text, Link } from "../index";

// Mock react-native-css
jest.mock("react-native-css", () => ({
  useCssElement: jest.fn((Component, props, config) => {
    // Basic simulation of useCssElement behavior
    const { className, ...rest } = props;
    const style = className ? { _className: className } : undefined;
    return <Component {...rest} style={style} />;
  }),
  useNativeVariable: jest.fn((variable) => `mock-value-for-${variable}`),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  Link: (props: any) => <div {...props} />,
}));

describe("Tailwind Component Wrappers", () => {
  it("View should accept className and pass it as simulated style", () => {
    const { getByTestId } = render(
      <View className="bg-blue-500" testID="view" />
    );
    const view = getByTestId("view");
    expect(view.props.style).toEqual({ _className: "bg-blue-500" });
  });

  it("Text should accept className and pass it as simulated style", () => {
    const { getByTestId } = render(
      <Text className="text-red-500" testID="text">Hello</Text>
    );
    const text = getByTestId("text");
    expect(text.props.style).toEqual({ _className: "text-red-500" });
  });

  it("Link should accept className and pass it as simulated style", () => {
    const { getByTestId } = render(
      <Link href="/" className="underline" testID="link">Link</Link>
    );
    const link = getByTestId("link");
    expect(link.props.style).toEqual({ _className: "underline" });
  });
});
