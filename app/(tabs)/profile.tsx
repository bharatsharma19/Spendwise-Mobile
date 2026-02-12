import { useColorScheme } from "@/hooks/use-color-scheme";
import AppButton from "@/src/components/AppButton";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useProfile, useUpdatePreferences } from "@/src/hooks/useProfile";
import { useAuthStore } from "@/src/store/auth.store";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Appearance, Pressable, Switch, Text, View } from "react-native";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, logout } = useAuthStore();
  const { data: profile } = useProfile();
  const updatePreferences = useUpdatePreferences();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayUser = profile || user;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch {
            // Silently handle
          }
          setLoggingOut(false);
        },
      },
    ]);
  };

  const toggleDarkMode = () => {
    const newTheme = isDark ? "light" : "dark";
    Appearance.setColorScheme(newTheme);
    updatePreferences.mutate({ theme: newTheme });
  };

  const MenuItem = ({
    icon,
    label,
    value,
    onPress,
    showToggle = false,
    toggleValue = false,
    onToggle,
    danger = false,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (val: boolean) => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-4 ${
        isDark ? "border-dark-border" : "border-slate-100"
      }`}
      style={{ borderBottomWidth: 1 }}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
          danger ? "bg-danger-50" : isDark ? "bg-dark-bg" : "bg-slate-100"
        }`}
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={danger ? "#ef4444" : isDark ? "#94a3b8" : "#64748b"}
        />
      </View>
      <Text
        className={`flex-1 text-base ${
          danger
            ? "text-danger-500 font-semibold"
            : isDark
              ? "text-dark-text"
              : "text-slate-900"
        }`}
      >
        {label}
      </Text>
      {value && (
        <Text className={isDark ? "text-dark-muted" : "text-slate-500"}>
          {value}
        </Text>
      )}
      {showToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: "#e2e8f0", true: "#a7f3d0" }}
          thumbColor={toggleValue ? "#10b981" : "#fff"}
        />
      )}
      {!showToggle && !value && !danger && (
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={isDark ? "#64748b" : "#94a3b8"}
        />
      )}
    </Pressable>
  );

  return (
    <ScreenWrapper>
      <View className="px-5 pt-4">
        {/* Header */}
        <Text
          className={`text-2xl font-bold mb-6 ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
        >
          Profile
        </Text>

        {/* User Info Card */}
        <View
          className={`p-5 rounded-2xl mb-6 items-center ${
            isDark ? "bg-dark-card" : "bg-white"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
            <Text className="text-primary-600 text-3xl font-bold">
              {(displayUser?.display_name || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            className={`text-xl font-bold ${
              isDark ? "text-dark-text" : "text-slate-900"
            }`}
          >
            {displayUser?.display_name || "User"}
          </Text>
          <Text
            className={`text-sm mt-1 ${
              isDark ? "text-dark-muted" : "text-slate-500"
            }`}
          >
            {displayUser?.email || ""}
          </Text>
          {displayUser?.phone_number ? (
            <Text
              className={`text-sm mt-0.5 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              {displayUser.phone_number}
            </Text>
          ) : null}

          {/* Status badges */}
          <View className="flex-row gap-2 mt-3">
            <View
              className={`px-3 py-1 rounded-full ${
                displayUser?.is_email_verified
                  ? "bg-success-50"
                  : "bg-warning-50"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  displayUser?.is_email_verified
                    ? "text-success-600"
                    : "text-warning-600"
                }`}
              >
                {displayUser?.is_email_verified
                  ? "✓ Email Verified"
                  : "⚠ Email Unverified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View
          className={`px-4 rounded-2xl ${isDark ? "bg-dark-card" : "bg-white"}`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <MenuItem
            icon="dark-mode"
            label="Dark Mode"
            showToggle
            toggleValue={isDark}
            onToggle={toggleDarkMode}
          />
          <MenuItem
            icon="language"
            label="Currency"
            value={displayUser?.preferences?.currency || "INR"}
          />
          <MenuItem
            icon="notifications"
            label="Notifications"
            value={displayUser?.preferences?.notifications?.push ? "On" : "Off"}
          />
          <MenuItem icon="security" label="Privacy & Security" />
          <MenuItem icon="help-outline" label="Help & Support" />
        </View>

        {/* Logout */}
        <View className="mt-6 mb-8">
          <AppButton
            title="Sign Out"
            onPress={handleLogout}
            variant="danger"
            loading={loggingOut}
          />
        </View>

        {/* App version */}
        <Text
          className={`text-center text-xs mb-4 ${
            isDark ? "text-dark-muted" : "text-slate-400"
          }`}
        >
          SpendWise v1.0.0
        </Text>
      </View>
    </ScreenWrapper>
  );
}
