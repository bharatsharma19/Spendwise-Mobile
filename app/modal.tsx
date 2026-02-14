import { useColorScheme } from "@/hooks/use-color-scheme";
import AppButton from "@/src/components/AppButton";
import AppInput from "@/src/components/AppInput";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpense,
  useUpdateExpense,
} from "@/src/hooks/useExpenses";
import {
  CreateExpenseDto,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  UpdateExpenseDto,
} from "@/src/types";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrency } from "../src/hooks/useCurrency";

export default function ExpenseModal() {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const isEditing = !!expenseId;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const { currencySymbol } = useCurrency();

  // Fetch expense details if editing
  const { data: expense, isLoading: isLoadingExpense } = useExpense(
    expenseId || "",
  );

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when expense data is loaded
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description || "");
      setCategory(expense.category);
      setDate(new Date(expense.date));
    }
  }, [expense]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = "Enter a valid amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditing) {
        const updateData: UpdateExpenseDto = {
          amount: parseFloat(amount),
          category,
          description: description.trim() || undefined,
          date: date.toISOString(),
          currency: "INR", // Default to INR for now, or expense.currency
        };
        await updateExpense.mutateAsync({ id: expenseId, data: updateData });
      } else {
        const createData: CreateExpenseDto = {
          amount: parseFloat(amount),
          category,
          description: description.trim() || undefined,
          date: date.toISOString(),
        };
        await createExpense.mutateAsync(createData);
      }
      router.back();
    } catch (err: any) {
      console.error(err);
      setErrors({
        general:
          err?.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} expense`,
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense.mutateAsync(expenseId);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete expense");
            }
          },
        },
      ],
    );
  };

  if (isEditing && isLoadingExpense) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <Pressable onPress={() => router.back()}>
            <MaterialIcons
              name="close"
              size={24}
              color={isDark ? "#f8fafc" : "#0f172a"}
            />
          </Pressable>
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-dark-text" : "text-slate-900"
            }`}
          >
            {isEditing ? "Edit Expense" : "Add Expense"}
          </Text>
          {isEditing ? (
            <Pressable onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
            </Pressable>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {errors.general && (
            <View className="bg-danger-50 border border-danger-500 rounded-xl p-3 mb-4">
              <Text className="text-danger-600 text-sm text-center">
                {errors.general}
              </Text>
            </View>
          )}

          {/* Amount Input */}
          <View className="items-center py-8">
            <Text
              className={`text-sm mb-2 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              Enter Amount
            </Text>
            <View className="flex-row items-baseline">
              <Text
                className={`text-2xl font-bold mr-1 ${
                  isDark ? "text-dark-text" : "text-slate-900"
                }`}
              >
                {currencySymbol}
              </Text>
              <AppInput
                label=""
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.amount}
                className="mb-0 flex-1"
              />
            </View>
          </View>

          {/* Description */}
          <AppInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What was this expense for?"
            autoCapitalize="sentences"
          />

          {/* Category Selection */}
          <Text
            className={`text-sm font-medium mb-3 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {EXPENSE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                className={`flex-row items-center px-3.5 py-2.5 rounded-xl ${
                  category === cat.value
                    ? "border-2 border-primary-500"
                    : isDark
                      ? "bg-dark-card"
                      : "bg-white"
                }`}
                style={
                  category === cat.value
                    ? { backgroundColor: isDark ? "#064e3b" : "#ecfdf5" }
                    : {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.03,
                        shadowRadius: 2,
                        elevation: 1,
                      }
                }
              >
                <MaterialIcons
                  name={cat.icon as keyof typeof MaterialIcons.glyphMap}
                  size={16}
                  color={
                    category === cat.value
                      ? isDark
                        ? "#34d399"
                        : "#059669"
                      : cat.color
                  }
                />
                <Text
                  className={`text-sm ml-1.5 font-medium ${
                    category === cat.value
                      ? isDark
                        ? "text-primary-400"
                        : "text-primary-700"
                      : isDark
                        ? "text-dark-text"
                        : "text-slate-700"
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Date Picker */}
          <Text
            className={`text-sm font-medium mb-3 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Date
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className={`flex-row items-center h-14 px-4 rounded-2xl mb-6 border ${
              isDark
                ? "border-dark-border bg-dark-card"
                : "border-slate-200 bg-white"
            }`}
          >
            <MaterialIcons
              name="calendar-today"
              size={20}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <Text
              className={`text-base ml-3 ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {date.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setDate(selectedDate);
              }}
              themeVariant={isDark ? "dark" : "light"}
            />
          )}

          {/* Submit */}
          <AppButton
            title={isEditing ? "Save Changes" : "Add Expense"}
            onPress={handleSubmit}
            loading={createExpense.isPending || updateExpense.isPending}
            className="mt-2 mb-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
