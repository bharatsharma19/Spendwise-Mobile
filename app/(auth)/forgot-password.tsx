import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/src/api/auth.api";
import { supabase } from "@/src/api/supabase";
import AppButton from "@/src/components/AppButton";
import AppInput from "@/src/components/AppInput";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "otp">("input");

  // Reset input when switching methods
  const handleMethodChange = (newMethod: "email" | "phone") => {
    setMethod(newMethod);
    setInputValue("");
    setOtp("");
    setNewPassword("");
  };

  const handleSendLink = async () => {
    if (method !== "email") return;
    if (!inputValue.trim() || !/\S+@\S+\.\S+/.test(inputValue)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(inputValue.trim());
      Alert.alert("Success", "Password reset link sent to your email.");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!inputValue.trim()) {
      Alert.alert(
        "Error",
        `Please enter a valid ${method === "email" ? "email address" : "phone number"}`,
      );
      return;
    }

    if (method === "email" && !/\S+@\S+\.\S+/.test(inputValue)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp(
        method === "email"
          ? { email: inputValue.trim() }
          : { phone: inputValue.trim() },
      );
      if (error) throw error;
      setStep("otp");
      Alert.alert(
        "Code Sent",
        `Please check your ${method === "email" ? "email" : "phone"} for the OTP code.`,
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert("Error", "Please enter OTP and new password");
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp(
        method === "email"
          ? {
              email: inputValue.trim(),
              token: otp.trim(),
              type: "email",
            }
          : {
              phone: inputValue.trim(),
              token: otp.trim(),
              type: "sms",
            },
      );

      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert("Success", "Password updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to verify code or update password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View className="flex-row items-center pt-4 pb-8">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800 -ml-2"
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={isDark ? "#f1f5f9" : "#0f172a"}
              />
            </Pressable>
          </View>

          <View className="mb-6">
            <Text
              className={`text-3xl font-bold mb-3 ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {step === "input" ? "Forgot Password?" : "Reset Password"}
            </Text>
            <Text
              className={`text-base ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              {step === "input"
                ? "Choose how you want to reset your password."
                : `Enter the code sent to your ${method} and your new password.`}
            </Text>
          </View>

          {step === "input" ? (
            <>
              {/* Method Toggle */}
              <View className="flex-row mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <Pressable
                  onPress={() => handleMethodChange("email")}
                  className={`flex-1 py-3 items-center rounded-lg ${
                    method === "email"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : ""
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      method === "email"
                        ? isDark
                          ? "text-white"
                          : "text-slate-900"
                        : isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                    }`}
                  >
                    Email
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleMethodChange("phone")}
                  className={`flex-1 py-3 items-center rounded-lg ${
                    method === "phone"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : ""
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      method === "phone"
                        ? isDark
                          ? "text-white"
                          : "text-slate-900"
                        : isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                    }`}
                  >
                    Phone
                  </Text>
                </Pressable>
              </View>

              <AppInput
                label={method === "email" ? "Email Address" : "Phone Number"}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={
                  method === "email"
                    ? "Enter your email"
                    : "Enter your phone number"
                }
                keyboardType={
                  method === "email" ? "email-address" : "phone-pad"
                }
                autoCapitalize="none"
                icon={
                  <MaterialIcons
                    name={method === "email" ? "email" : "phone"}
                    size={20}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                }
              />

              <View className="gap-4 mt-6">
                {method === "email" && (
                  <>
                    <AppButton
                      title="Send Reset Link"
                      onPress={handleSendLink}
                      loading={loading}
                    />
                    <View className="flex-row items-center justify-center">
                      <View className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                      <Text className="mx-4 text-slate-400 dark:text-slate-500">
                        OR
                      </Text>
                      <View className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                    </View>
                  </>
                )}

                <AppButton
                  title={method === "email" ? "Send OTP Code" : "Send OTP"}
                  onPress={handleSendOtp}
                  variant={method === "email" ? "outline" : "primary"}
                  loading={loading}
                />
              </View>
            </>
          ) : (
            <>
              <AppInput
                label="OTP Code"
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit code"
                keyboardType="numeric"
                icon={
                  <MaterialIcons
                    name="lock-clock"
                    size={20}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                }
              />
              <AppInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
                icon={
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                }
              />
              <AppButton
                title="Reset Password"
                onPress={handleVerifyAndReset}
                loading={loading}
                className="mt-6"
              />
              <Pressable
                onPress={() => setStep("input")}
                className="mt-4 items-center"
              >
                <Text className="text-primary-500 font-semibold">
                  Change Method
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
