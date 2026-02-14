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

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Send OTP
  const handleSendOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyPhone(phoneNumber.trim());
      setStep("otp");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert("Error", "Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.verifyPhoneCode(
        phoneNumber.trim(),
        otp.trim(),
      );

      Alert.alert("Success", "Phone number verified!", [
        {
          text: "OK",
          onPress: () => {
            if (result.actionLink) {
              // If backend returned a magic link, we could parse it or just go to dashboard
              // For now, let's assume session is handled or we redirect to login
              // But standard flow: this creates a session?
              // Backend verifyPhoneCode returns actionLink but doesn't set session cookie likely (unless browser)
              // We might need to handle the token from actionLink or just ask user to login
              router.replace("/(auth)/login");
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to verify OTP");
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

          <View className="mb-8">
            <Text
              className={`text-3xl font-bold mb-3 ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {step === "phone" ? "Verify Phone" : "Enter Code"}
            </Text>
            <Text
              className={`text-base ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              {step === "phone"
                ? "Enter your phone number to receive a verification code."
                : `We sent a code to ${phoneNumber}. Please enter it below.`}
            </Text>
          </View>

          {step === "phone" ? (
            <AppInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              icon={
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              }
            />
          ) : (
            <AppInput
              label="Verification Code"
              value={otp}
              onChangeText={setOtp}
              placeholder="123456"
              keyboardType="phone-pad"
              maxLength={6}
              icon={
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              }
            />
          )}

          <AppButton
            title={step === "phone" ? "Send Code" : "Verify Code"}
            onPress={step === "phone" ? handleSendOtp : handleVerifyOtp}
            loading={loading}
            className="mt-6"
          />

          {step === "otp" && (
            <Pressable
              onPress={() => setStep("phone")}
              className="mt-4 items-center"
            >
              <Text className="text-primary-500 font-semibold">
                Change Phone Number
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
