import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { CategoryColors, CategoryIcons } from "../theme";
import { Expense } from "../types";

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

export default function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const categoryColor = CategoryColors[expense.category] || "#6b7280";
  const categoryIcon = (CategoryIcons[expense.category] ||
    "more-horiz") as keyof typeof MaterialIcons.glyphMap;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${
        isDark ? "bg-dark-card" : "bg-white"
      }`}
      style={{
        shadowColor: isDark ? "#000" : "#64748b",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Category Icon */}
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: categoryColor + "18" }}
      >
        <MaterialIcons name={categoryIcon} size={22} color={categoryColor} />
      </View>

      {/* Details */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
          numberOfLines={1}
        >
          {expense.description || expense.category}
        </Text>
        <Text
          className={`text-sm mt-0.5 ${
            isDark ? "text-dark-muted" : "text-slate-500"
          }`}
        >
          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}{" "}
          • {formatDate(expense.date)}
        </Text>
      </View>

      {/* Amount */}
      <Text className="text-base font-bold text-danger-500">
        -{formatAmount(expense.amount, expense.currency)}
      </Text>
    </Pressable>
  );
}
