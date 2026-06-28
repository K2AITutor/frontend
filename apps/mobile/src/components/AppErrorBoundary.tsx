import React from "react";
import { Button } from "./ui";
import { captureException } from "../lib/observability";
import { Text, View } from "../tw";

type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error boundary caught an error", error, info);
    captureException(error);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-background p-8">
          <Text className="mb-2 text-center text-2xl font-bold text-foreground">
            Something went wrong
          </Text>
          <Text className="mb-6 text-center text-muted-foreground">
            We hit an unexpected error. Try again, and if it keeps happening contact support.
          </Text>
          <Button label="Try again" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }

    return this.props.children;
  }
}
