import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import AppButton from "./AppButton";

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "inbox",
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View
        className={`w-20 h-20 rounded-full items-center justify-center mb-5 ${
          isDark ? "bg-dark-card" : "bg-slate-100"
        }`}
      >
        <MaterialIcons
          name={icon}
          size={36}
          color={isDark ? "#64748b" : "#94a3b8"}
        />
      </View>
      <Text
        className={`text-lg font-semibold text-center mb-2 ${
          isDark ? "text-dark-text" : "text-slate-900"
        }`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className={`text-sm text-center leading-5 ${
            isDark ? "text-dark-muted" : "text-slate-500"
          }`}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <View className="mt-6">
          <AppButton title={actionLabel} onPress={onAction} size="md" />
        </View>
      )}
    </View>
  );
}
