import { useColorScheme } from "@/hooks/use-color-scheme";
import EmptyState from "@/src/components/EmptyState";
import ExpenseCard from "@/src/components/ExpenseCard";
import { useGroupExpenses } from "@/src/hooks/useGroups";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupExpensesScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: rawExpenses, isLoading, refetch } = useGroupExpenses(groupId!);

  const expenses = React.useMemo(() => {
    if (!rawExpenses) return [];
    return rawExpenses.map((e) => ({
      ...e,
      userId: e.paidBy,
      isRecurring: false,
      isSplit: e.splits && e.splits.length > 0,
      category: e.category as any, // Cast to ExpenseCategory
      description: e.description || "",
      // Add missing optional properties with defaults
      createdAt: e.createdAt,
      updatedAt: e.updatedAt || e.createdAt,
    }));
  }, [rawExpenses]);

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Pressable onPress={() => router.back()} className="mr-3">
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#f1f5f9" : "#0f172a"}
          />
        </Pressable>
        <Text
          className={`text-2xl font-bold flex-1 ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
        >
          Group Expenses
        </Text>
      </View>

      {/* Expense List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : !expenses || expenses.length === 0 ? (
        <EmptyState
          icon="receipt-long"
          title="No expenses found"
          subtitle="Expenses added to this group will appear here."
          actionLabel="Add Expense"
          onAction={() =>
            router.push({
              pathname: "/groups/add-expense",
              params: { groupId },
            })
          }
        />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-5">
              <ExpenseCard
                expense={item}
                // Optional: Navigate to expense details if needed
                onPress={() =>
                  Alert.alert(
                    "Expense Details",
                    `${item.description}: ${item.amount} ${item.currency}`,
                  )
                }
              />
            </View>
          )}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/groups/add-expense",
            params: { groupId },
          })
        }
        className="absolute bottom-10 right-5 w-14 h-14 bg-primary-500 rounded-full items-center justify-center"
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
