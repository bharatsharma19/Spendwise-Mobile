import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export default function ScreenWrapper({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  className = "",
}: ScreenWrapperProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (scrollable) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
        edges={["top"]}
      >
        <ScrollView
          className={`flex-1 ${className}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#34d399" : "#10b981"}
                colors={["#10b981"]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"} ${className}`}
      edges={["top"]}
    >
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
