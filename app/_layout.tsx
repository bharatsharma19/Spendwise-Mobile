import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as LocalAuthentication from "expo-local-authentication";
import {
  Href,
  Slot,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/src/api/supabase";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { useAuthStore } from "@/src/store/auth.store";
import { usePushNotifications } from "../src/hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const rootNavigationState = useRootNavigationState();

  usePushNotifications();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Biometric Auth State
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] =
    React.useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = React.useState(false);
  const [checkingBiometrics, setCheckingBiometrics] = React.useState(true);
  const appState = React.useRef(AppState.currentState);

  // Hook must be called unconditionally
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Check support on mount
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
      // If not supported, we consider them "authenticated" biometrically simply to bypass
      if (!compatible || !enrolled) {
        setIsBiometricAuthenticated(true);
      }
      setCheckingBiometrics(false);
    })();
  }, []);

  // Trigger Auth
  const authenticateBiometrics = React.useCallback(async () => {
    if (!isAuthenticated || !isBiometricSupported) return;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock SpendWise",
        fallbackLabel: "Use Passcode",
      });
      if (result.success) {
        setIsBiometricAuthenticated(true);
      }
    } catch (error) {
      console.log("Biometric error", error);
    }
  }, [isAuthenticated, isBiometricSupported]);

  // Initial authentication trigger
  useEffect(() => {
    if (
      isAuthenticated &&
      isBiometricSupported &&
      !checkingBiometrics &&
      !isBiometricAuthenticated
    ) {
      authenticateBiometrics();
    }
  }, [
    isAuthenticated,
    isBiometricSupported,
    checkingBiometrics,
    isBiometricAuthenticated,
    authenticateBiometrics,
  ]);

  // Handle app state changes (lock on background)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App coming to foreground
        // Optional: require re-auth (commented out for now to be less annoying during dev)
        // if (isAuthenticated && isBiometricSupported) {
        //    setIsBiometricAuthenticated(false);
        //    authenticateBiometrics();
        // }
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isBiometricSupported]);

  // Handle auth-based navigation
  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login" as Href);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/dashboard" as Href);
    }
  }, [isAuthenticated, isLoading, segments, rootNavigationState, router]);

  // Hide splash screen when auth state is determined
  useEffect(() => {
    if (!isLoading && !checkingBiometrics) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, checkingBiometrics]);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // const store = useAuthStore.getState();

      if (event === "SIGNED_IN" && session) {
        useAuthStore.setState({
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({
          session: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        setIsBiometricAuthenticated(false); // Reset on logout
      } else if (event === "TOKEN_REFRESHED" && session) {
        useAuthStore.setState({ session });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Block access if authenticated but not biometrically verified
  if (isAuthenticated && isBiometricSupported && !isBiometricAuthenticated) {
    // Show Unlock Screen

    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      >
        <View className="mb-6 w-20 h-20 bg-primary-500 rounded-full items-center justify-center">
          <Text className="text-white text-3xl">🔒</Text>
        </View>
        <Text
          className={`text-xl font-bold mb-8 ${isDark ? "text-dark-text" : "text-slate-900"}`}
        >
          SpendWise is Locked
        </Text>
        <Pressable
          onPress={authenticateBiometrics}
          className="bg-primary-500 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-bold text-lg">Unlock</Text>
        </Pressable>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ErrorBoundary>
            <AuthGate />
            <StatusBar style="auto" />
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
