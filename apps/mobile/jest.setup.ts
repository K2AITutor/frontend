// @ts-nocheck

jest.mock("react-native-webview", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    WebView: (props: any) => React.createElement(View, { testID: "webview", ...props }),
  };
});

jest.mock("react-native-css", () => ({
  useCssElement: (Component: any, props: any) => {
    const React = require("react");
    return React.createElement(Component, props);
  },
  useNativeVariable: (variable: string) => variable,
}));
