import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  icon,
  className = "",
}: AppButtonProps) {
  const handlePress = async () => {
    if (loading || disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const baseClasses = "flex-row items-center justify-center rounded-2xl";

  const sizeClasses = {
    sm: "h-10 px-4",
    md: "h-12 px-6",
    lg: "h-14 px-8",
  };

  const variantClasses = {
    primary: "bg-primary-500 active:bg-primary-600",
    secondary:
      "bg-slate-100 active:bg-slate-200 dark:bg-dark-card dark:active:bg-slate-700",
    outline: "border-2 border-primary-500 bg-transparent active:bg-primary-50",
    ghost: "bg-transparent active:bg-slate-100 dark:active:bg-dark-card",
    danger: "bg-danger-500 active:bg-danger-600",
  };

  const textClasses = {
    primary: "text-white font-semibold",
    secondary: "text-slate-700 font-semibold dark:text-slate-200",
    outline: "text-primary-500 font-semibold",
    ghost: "text-primary-500 font-semibold",
    danger: "text-white font-semibold",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-base",
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger" ? "#fff" : "#10b981"
          }
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`${textClasses[variant]} ${textSizeClasses[size]} ${
              icon ? "ml-2" : ""
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
