import { useColorScheme } from "@/hooks/use-color-scheme";
import EmptyState from "@/src/components/EmptyState";
import ExpenseCard from "@/src/components/ExpenseCard";
import { ExpenseCardSkeleton } from "@/src/components/SkeletonLoader";
import { useExpenses } from "@/src/hooks/useExpenses";
import {
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  ExpenseFilters,
} from "@/src/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExpensesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategory | undefined
  >();
  const [refreshing, setRefreshing] = useState(false);

  const filters: ExpenseFilters = useMemo(
    () => ({
      category: selectedCategory,
    }),
    [selectedCategory],
  );

  const {
    data: expenses,
    isLoading,
    refetch,
  } = useExpenses(selectedCategory ? filters : undefined);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      edges={["top"]}
    >
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text
          className={`text-2xl font-bold ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
        >
          Expenses
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 py-3"
        contentContainerStyle={{ gap: 8 }}
      >
        <Pressable
          onPress={() => setSelectedCategory(undefined)}
          className={`px-4 py-2 rounded-full ${
            !selectedCategory
              ? "bg-primary-500"
              : isDark
                ? "bg-dark-card"
                : "bg-white"
          }`}
          style={
            !selectedCategory
              ? {}
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }
          }
        >
          <Text
            className={`text-sm font-semibold ${
              !selectedCategory
                ? "text-white"
                : isDark
                  ? "text-dark-muted"
                  : "text-slate-600"
            }`}
          >
            All
          </Text>
        </Pressable>
        {EXPENSE_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === cat.value ? undefined : cat.value,
              )
            }
            className={`px-4 py-2 rounded-full ${
              selectedCategory === cat.value
                ? "bg-primary-500"
                : isDark
                  ? "bg-dark-card"
                  : "bg-white"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedCategory === cat.value
                  ? "text-white"
                  : isDark
                    ? "text-dark-muted"
                    : "text-slate-600"
              }`}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Expense List */}
      {isLoading ? (
        <View className="px-5 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <ExpenseCardSkeleton key={i} />
          ))}
        </View>
      ) : !expenses || expenses.length === 0 ? (
        <EmptyState
          icon="receipt-long"
          title="No expenses found"
          subtitle={
            selectedCategory
              ? `No ${selectedCategory} expenses recorded`
              : "Tap + to add your first expense"
          }
          actionLabel="Add Expense"
          onAction={() => router.push("/modal")}
        />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-5">
              <ExpenseCard expense={item} />
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/modal")}
        className="absolute bottom-28 right-5 w-14 h-14 bg-primary-500 rounded-full items-center justify-center"
        style={{
          shadowColor: "#10b981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
