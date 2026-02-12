import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/src/api/supabase";
import { useAuthStore } from "@/src/store/auth.store";

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

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

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
  }, [isAuthenticated, isLoading, segments, rootNavigationState]);

  // Hide splash screen when auth state is determined
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

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
      } else if (event === "TOKEN_REFRESHED" && session) {
        useAuthStore.setState({ session });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <AuthGate />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
