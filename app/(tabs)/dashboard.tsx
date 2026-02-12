import { useColorScheme } from "@/hooks/use-color-scheme";
import EmptyState from "@/src/components/EmptyState";
import ExpenseCard from "@/src/components/ExpenseCard";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { DashboardSkeleton } from "@/src/components/SkeletonLoader";
import {
  useCategoryStats,
  useExpenses,
  useExpenseSummary,
} from "@/src/hooks/useExpenses";
import { useAuthStore } from "@/src/store/auth.store";
import { CategoryColors } from "@/src/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAuthStore();

  const currentMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  }, []);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useExpenseSummary(currentMonth);

  const {
    data: categoryStats,
    isLoading: categoryLoading,
    refetch: refetchCategory,
  } = useCategoryStats(currentMonth);

  const {
    data: recentExpenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useExpenses();

  const isLoading = summaryLoading && categoryLoading && expensesLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchCategory(), refetchExpenses()]);
    setRefreshing(false);
  }, [refetchSummary, refetchCategory, refetchExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const topCategories = useMemo(() => {
    if (!categoryStats) return [];
    return Object.entries(categoryStats)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 4);
  }, [categoryStats]);

  const recentItems = useMemo(() => {
    return (recentExpenses || []).slice(0, 5);
  }, [recentExpenses]);

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <DashboardSkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
      <View className="px-5 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text
              className={`text-sm ${isDark ? "text-dark-muted" : "text-slate-500"}`}
            >
              Welcome back,
            </Text>
            <Text
              className={`text-2xl font-bold mt-0.5 ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {user?.display_name || "User"} 👋
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/notifications" as Href)}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              isDark ? "bg-dark-card" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <MaterialIcons
              name="notifications-none"
              size={22}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
          </Pressable>
        </View>

        {/* Monthly Spend Card */}
        <View
          className="rounded-2xl p-5 mb-4 overflow-hidden"
          style={{
            backgroundColor: isDark ? "#064e3b" : "#10b981",
          }}
        >
          <Text className="text-emerald-100 text-sm font-medium">
            {"This Month's Spending"}
          </Text>
          <Text className="text-white text-4xl font-bold mt-2">
            {formatCurrency(summary?.total || 0)}
          </Text>
          <View className="flex-row mt-3 gap-6">
            <View>
              <Text className="text-emerald-200 text-xs">Transactions</Text>
              <Text className="text-white text-base font-semibold">
                {summary?.count || 0}
              </Text>
            </View>
            <View>
              <Text className="text-emerald-200 text-xs">Average</Text>
              <Text className="text-white text-base font-semibold">
                {formatCurrency(summary?.average || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View
            className={`flex-1 p-4 rounded-2xl ${
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
            <MaterialIcons name="trending-down" size={20} color="#22c55e" />
            <Text
              className={`text-xs mt-2 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Lowest
            </Text>
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {formatCurrency(summary?.min || 0)}
            </Text>
          </View>
          <View
            className={`flex-1 p-4 rounded-2xl ${
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
            <MaterialIcons name="trending-up" size={20} color="#ef4444" />
            <Text
              className={`text-xs mt-2 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Highest
            </Text>
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {formatCurrency(summary?.max || 0)}
            </Text>
          </View>
        </View>

        {/* Split Expenses Quick Action */}
        <Pressable
          onPress={() => router.push("/groups" as Href)}
          className={`flex-row items-center p-4 rounded-2xl mb-6 ${
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
          <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center mr-3">
            <MaterialIcons name="group" size={22} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text
              className={`text-sm font-semibold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              Split Expenses
            </Text>
            <Text
              className={`text-xs ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Create groups and split bills with friends
            </Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={isDark ? "#64748b" : "#94a3b8"}
          />
        </Pressable>

        {/* Category Breakdown */}
        {topCategories.length > 0 && (
          <>
            <Text
              className={`text-lg font-bold mb-4 ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              Top Categories
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {topCategories.map(([category, stats]) => (
                <View
                  key={category}
                  className={`flex-1 min-w-[45%] p-4 rounded-2xl ${
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
                  <View
                    className="w-9 h-9 rounded-lg items-center justify-center mb-2"
                    style={{
                      backgroundColor:
                        (CategoryColors[category] || "#6b7280") + "18",
                    }}
                  >
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: CategoryColors[category] || "#6b7280",
                      }}
                    />
                  </View>
                  <Text
                    className={`text-xs capitalize ${
                      isDark ? "text-dark-muted" : "text-slate-500"
                    }`}
                  >
                    {category}
                  </Text>
                  <Text
                    className={`text-base font-bold mt-0.5 ${
                      isDark ? "text-dark-text" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(stats.total)}
                  </Text>
                  <Text className="text-xs text-primary-500 font-medium">
                    {stats.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Recent Transactions */}
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-dark-text" : "text-slate-900"
            }`}
          >
            Recent Transactions
          </Text>
          {recentItems.length > 0 && (
            <Pressable onPress={() => router.push("/(tabs)/expenses" as Href)}>
              <Text className="text-primary-500 text-sm font-semibold">
                See All
              </Text>
            </Pressable>
          )}
        </View>

        {recentItems.length === 0 ? (
          <EmptyState
            icon="receipt-long"
            title="No expenses yet"
            subtitle="Add your first expense to start tracking your spending"
          />
        ) : (
          recentItems.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        )}
      </View>
    </ScreenWrapper>
  );
}
