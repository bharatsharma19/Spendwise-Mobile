import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/src/api/auth.api";
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

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      >
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="mark-email-read" size={40} color="#10b981" />
          </View>
          <Text
            className={`text-2xl font-bold mb-2 text-center ${
              isDark ? "text-dark-text" : "text-slate-900"
            }`}
          >
            Check your email
          </Text>
          <Text
            className={`text-base text-center mb-8 ${
              isDark ? "text-dark-muted" : "text-slate-500"
            }`}
          >
            We have sent a password reset link to{"\n"}
            <Text className="font-semibold text-slate-800 dark:text-slate-200">
              {email}
            </Text>
          </Text>

          <AppButton
            title="Back to Login"
            onPress={() => router.back()}
            variant="outline"
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

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

          <View className="mb-8">
            <Text
              className={`text-3xl font-bold mb-3 ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              Forgot Password?
            </Text>
            <Text
              className={`text-base ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Don&apos;t worry! It happens. Please enter the email address
              associated with your account.
            </Text>
          </View>

          <AppInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={
              <MaterialIcons
                name="email"
                size={20}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
            }
          />

          <AppButton
            title="Send Reset Link"
            onPress={handleReset}
            loading={loading}
            className="mt-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
