import { useColorScheme } from "@/hooks/use-color-scheme";
import AppButton from "@/src/components/AppButton";
import AppInput from "@/src/components/AppInput";
import { useAuthStore } from "@/src/store/auth.store";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { register } = useAuthStore();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Min 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password =
        "Must include uppercase, lowercase, number, and special character";
    }
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      await register({
        email: email.toLowerCase().trim(),
        password,
        displayName: displayName.trim(),
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
      setErrors({ general: msg });
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
          {/* Header */}
          <View className="mb-8">
            <Text
              className={`text-3xl font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              Create Account
            </Text>
            <Text
              className={`text-base mt-2 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Start tracking your expenses smartly
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
              label="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="John Doe"
              autoCapitalize="words"
              error={errors.displayName}
            />

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
              placeholder="Min 8 characters, mixed case + number + symbol"
              secureTextEntry
              error={errors.password}
            />

            <AppInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <AppButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              className="mt-2"
            />
          </View>

          {/* Login link */}
          <View className="flex-row justify-center mt-8">
            <Text className={isDark ? "text-dark-muted" : "text-slate-500"}>
              Already have an account?{" "}
            </Text>
            <Text
              className="text-primary-500 font-semibold"
              onPress={() => router.back()}
            >
              Sign In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
