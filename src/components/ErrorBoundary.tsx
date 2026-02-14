import { MaterialIcons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "./AppButton";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
              <MaterialIcons name="error-outline" size={40} color="#ef4444" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
              Oops! Something went wrong
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
              {this.state.error?.message || "An unexpected error occurred"}
            </Text>
            <AppButton
              title="Try Again"
              onPress={this.handleRetry}
              variant="primary"
              className="w-full"
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
