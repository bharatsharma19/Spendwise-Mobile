import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Text, TextInput, View } from "react-native";

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: React.ReactNode;
  className?: string;
}

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  editable = true,
  multiline = false,
  numberOfLines = 1,
  icon,
  className = "",
}: AppInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className={`mb-4 ${className}`}>
      <Text
        className={`text-sm font-medium mb-1.5 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border px-4 ${
          multiline ? "py-3" : "h-14"
        } ${
          error
            ? "border-danger-500"
            : isDark
              ? "border-dark-border bg-dark-card"
              : "border-slate-200 bg-white"
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          className={`flex-1 text-base ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
          style={{ textAlignVertical: multiline ? "top" : "center" }}
        />
      </View>
      {error && (
        <Text className="text-danger-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
