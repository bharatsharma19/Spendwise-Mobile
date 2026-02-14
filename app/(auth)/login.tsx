import { useColorScheme } from "@/hooks/use-color-scheme";
import AppButton from "@/src/components/AppButton";
import AppInput from "@/src/components/AppInput";
import { useAuthStore } from "@/src/store/auth.store";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      await login(email.toLowerCase().trim(), password);
    } catch (err: any) {
      setErrors({
        general: err?.message || "Login failed. Check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Header */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-primary-500 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">S</Text>
            </View>
            <Text
              className={`text-3xl font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              SpendWise
            </Text>
            <Text
              className={`text-base mt-2 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Smart expense tracking, simplified
            </Text>
          </View>

          {/* Form */}
          <View>
            {errors.general && (
              <View className="bg-danger-50 border border-danger-500 rounded-xl p-3 mb-4">
                <Text className="text-danger-600 text-sm text-center">
                  {errors.general}
                </Text>
              </View>
            )}

            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />

            <View className="items-end mb-4">
              <Text
                className={`text-sm ${
                  isDark ? "text-primary-400" : "text-primary-600"
                }`}
                onPress={() => router.push("/(auth)/forgot-password" as Href)}
              >
                Forgot Password?
              </Text>
            </View>

            <AppButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mt-2"
            />
          </View>

          {/* Register link */}
          <View className="flex-row justify-center mt-8">
            <Text className={isDark ? "text-dark-muted" : "text-slate-500"}>
              {"Don't have an account? "}
            </Text>
            <Text
              className="text-primary-500 font-semibold"
              onPress={() => router.push("/(auth)/register" as Href)}
            >
              Sign Up
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
