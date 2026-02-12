import { useColorScheme } from "@/hooks/use-color-scheme";
import EmptyState from "@/src/components/EmptyState";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { DashboardSkeleton } from "@/src/components/SkeletonLoader";
import {
  useCategoryStats,
  useExpenseSummary,
  useExpenseTrends,
} from "@/src/hooks/useExpenses";
import { CategoryColors } from "@/src/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
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
    data: trends,
    isLoading: trendsLoading,
    refetch: refetchTrends,
  } = useExpenseTrends("monthly");

  const isLoading = summaryLoading && categoryLoading && trendsLoading;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchCategory(), refetchTrends()]);
    setRefreshing(false);
  }, [refetchSummary, refetchCategory, refetchTrends]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const sortedCategories = useMemo(() => {
    if (!categoryStats) return [];
    return Object.entries(categoryStats).sort(
      ([, a], [, b]) => b.total - a.total,
    );
  }, [categoryStats]);

  const monthlyTrends = useMemo(() => {
    if (!trends?.byDate) return [];
    return Object.entries(trends.byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [trends]);

  if (isLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <DashboardSkeleton />
      </ScreenWrapper>
    );
  }

  const hasData = (summary?.count || 0) > 0;

  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
      <View className="px-5 pt-4">
        {/* Header */}
        <Text
          className={`text-2xl font-bold mb-6 ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
        >
          Insights
        </Text>

        {!hasData ? (
          <EmptyState
            icon="insights"
            title="No insights yet"
            subtitle="Start tracking expenses to see your spending patterns and insights"
          />
        ) : (
          <>
            {/* Spending Overview */}
            <View
              className={`p-5 rounded-2xl mb-4 ${isDark ? "bg-dark-card" : "bg-white"}`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="flex-row items-center mb-3">
                <MaterialIcons
                  name="analytics"
                  size={20}
                  color={isDark ? "#34d399" : "#10b981"}
                />
                <Text
                  className={`text-base font-semibold ml-2 ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                >
                  Spending Overview
                </Text>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text
                    className={`text-xs ${isDark ? "text-dark-muted" : "text-slate-500"}`}
                  >
                    Total Spent
                  </Text>
                  <Text
                    className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-slate-900"}`}
                  >
                    {formatCurrency(summary?.total || 0)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`text-xs ${isDark ? "text-dark-muted" : "text-slate-500"}`}
                  >
                    Avg per expense
                  </Text>
                  <Text
                    className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-slate-900"}`}
                  >
                    {formatCurrency(summary?.average || 0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown (Bar chart) */}
            {sortedCategories.length > 0 && (
              <View
                className={`p-5 rounded-2xl mb-4 ${isDark ? "bg-dark-card" : "bg-white"}`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-row items-center mb-4">
                  <MaterialIcons
                    name="pie-chart"
                    size={20}
                    color={isDark ? "#34d399" : "#10b981"}
                  />
                  <Text
                    className={`text-base font-semibold ml-2 ${
                      isDark ? "text-dark-text" : "text-slate-900"
                    }`}
                  >
                    Category Breakdown
                  </Text>
                </View>

                {sortedCategories.map(([category, stats], index) => {
                  const color = CategoryColors[category] || "#6b7280";
                  return (
                    <View key={category} className={index > 0 ? "mt-4" : ""}>
                      <View className="flex-row justify-between items-center mb-1.5">
                        <Text
                          className={`text-sm capitalize font-medium ${
                            isDark ? "text-dark-text" : "text-slate-700"
                          }`}
                        >
                          {category}
                        </Text>
                        <Text
                          className={`text-sm font-semibold ${
                            isDark ? "text-dark-text" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(stats.total)}
                        </Text>
                      </View>
                      {/* Progress bar */}
                      <View
                        className={`h-2.5 rounded-full ${
                          isDark ? "bg-slate-700" : "bg-slate-100"
                        }`}
                      >
                        <View
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(stats.percentage, 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </View>
                      <Text
                        className={`text-xs mt-1 ${
                          isDark ? "text-dark-muted" : "text-slate-500"
                        }`}
                      >
                        {stats.count} transactions •{" "}
                        {stats.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Monthly Trends */}
            {monthlyTrends.length > 0 && (
              <View
                className={`p-5 rounded-2xl mb-4 ${isDark ? "bg-dark-card" : "bg-white"}`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View className="flex-row items-center mb-4">
                  <MaterialIcons
                    name="show-chart"
                    size={20}
                    color={isDark ? "#34d399" : "#10b981"}
                  />
                  <Text
                    className={`text-base font-semibold ml-2 ${
                      isDark ? "text-dark-text" : "text-slate-900"
                    }`}
                  >
                    Monthly Trends
                  </Text>
                </View>

                {monthlyTrends.map(([month, data], index) => {
                  const maxAmount = Math.max(
                    ...monthlyTrends.map(([, d]) => d.total),
                  );
                  const percentage =
                    maxAmount > 0 ? (data.total / maxAmount) * 100 : 0;
                  const monthLabel = new Date(month + "-01").toLocaleDateString(
                    "en-IN",
                    {
                      month: "short",
                      year: "2-digit",
                    },
                  );

                  return (
                    <View key={month} className={index > 0 ? "mt-3" : ""}>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text
                          className={`text-sm ${
                            isDark ? "text-dark-muted" : "text-slate-600"
                          }`}
                        >
                          {monthLabel}
                        </Text>
                        <Text
                          className={`text-sm font-semibold ${
                            isDark ? "text-dark-text" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(data.total)}
                        </Text>
                      </View>
                      <View
                        className={`h-2 rounded-full ${
                          isDark ? "bg-slate-700" : "bg-slate-100"
                        }`}
                      >
                        <View
                          className="h-2 rounded-full bg-primary-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Smart Tips */}
            <View
              className={`p-5 rounded-2xl mb-4 ${isDark ? "bg-dark-card" : "bg-white"}`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                <Text
                  className={`text-base font-semibold ml-2 ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                >
                  Smart Tips
                </Text>
              </View>

              {sortedCategories.length > 0 && (
                <View className="flex-row items-start mb-3">
                  <MaterialIcons
                    name="arrow-right"
                    size={16}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                  <Text
                    className={`flex-1 text-sm ml-2 leading-5 ${
                      isDark ? "text-dark-muted" : "text-slate-600"
                    }`}
                  >
                    Your top spending category is{" "}
                    <Text className="font-semibold capitalize">
                      {sortedCategories[0]?.[0]}
                    </Text>{" "}
                    at{" "}
                    <Text className="font-semibold">
                      {sortedCategories[0]?.[1]?.percentage.toFixed(0)}%
                    </Text>{" "}
                    of total spend.
                  </Text>
                </View>
              )}

              <View className="flex-row items-start">
                <MaterialIcons
                  name="arrow-right"
                  size={16}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
                <Text
                  className={`flex-1 text-sm ml-2 leading-5 ${
                    isDark ? "text-dark-muted" : "text-slate-600"
                  }`}
                >
                  {"You've made"}{" "}
                  <Text className="font-semibold">{summary?.count}</Text>{" "}
                  transactions this month with an average of{" "}
                  <Text className="font-semibold">
                    {formatCurrency(summary?.average || 0)}
                  </Text>{" "}
                  per transaction.
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}
