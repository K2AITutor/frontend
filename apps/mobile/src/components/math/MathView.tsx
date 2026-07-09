import React, { useMemo, useState } from "react";
import { WebView } from "react-native-webview";
import { Text, useCSSVariable, View } from "../../tw";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hasMath(value: string) {
  return /(\$\$?|\\\(|\\\[|\\frac|\\sqrt|\\sum|\\int)/.test(value);
}

function toHtml(value: string, foreground: string, muted: string, background: string) {
  const escaped = escapeHtml(value).replace(/\n/g, "<br />");

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: ${background};
      color: ${foreground};
      font-family: "DM Sans", system-ui, sans-serif;
      font-size: 16px;
      line-height: 1.65;
    }
    .muted { color: ${muted}; }
    #content { padding: 0; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <div id="content">${escaped}</div>
  <script>
    function postHeight() {
      window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
    }
    window.addEventListener("load", function () {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\\\(", right: "\\\\)", display: false },
          { left: "\\\\[", right: "\\\\]", display: true }
        ],
        throwOnError: false
      });
      setTimeout(postHeight, 50);
      setTimeout(postHeight, 250);
    });
  </script>
</body>
</html>`;
}

export function MathView({ value }: { value: string }) {
  const [height, setHeight] = useState(1);
  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted-foreground");
  const background = useCSSVariable("--color-background");

  const html = useMemo(
    () => toHtml(value, foreground, muted, background),
    [background, foreground, muted, value]
  );

  if (!hasMath(value)) {
    return <Text className="text-base leading-7 text-foreground">{value}</Text>;
  }

  return (
    <View className="w-full overflow-hidden rounded-xl">
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        style={{ height, backgroundColor: background }}
        onMessage={(event) => {
          const nextHeight = Number(event.nativeEvent.data);
          if (Number.isFinite(nextHeight) && nextHeight > 0) {
            setHeight(nextHeight);
          }
        }}
      />
    </View>
  );
}
