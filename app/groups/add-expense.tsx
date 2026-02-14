import { useColorScheme } from "@/hooks/use-color-scheme";
import { AddGroupExpenseDto } from "@/src/api/group.api";
import { useAddGroupExpense, useGroup } from "@/src/hooks/useGroups";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrencySymbol } from "@/src/utils/currency";

const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: "restaurant" },
  { id: "transportation", name: "Transportation", icon: "directions-car" },
  { id: "housing", name: "Housing", icon: "home" },
  { id: "utilities", name: "Utilities", icon: "lightbulb" },
  { id: "entertainment", name: "Entertainment", icon: "movie" },
  { id: "healthcare", name: "Healthcare", icon: "local-hospital" },
  { id: "shopping", name: "Shopping", icon: "shopping-bag" },
  { id: "education", name: "Education", icon: "school" },
  { id: "other", name: "Other", icon: "more-horiz" },
];

export default function AddGroupExpenseScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: group } = useGroup(groupId!);
  const addGroupExpense = useAddGroupExpense();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!groupId) {
      Alert.alert("Error", "Group ID is missing");
      return;
    }

    const expenseData: AddGroupExpenseDto = {
      amount: parseFloat(amount),
      currency: group?.currency || "INR",
      category,
      description: description.trim() || undefined,
      date: date.toISOString(),
      // Default to equal split (handled by backend if splits undefined)
    };

    try {
      await addGroupExpense.mutateAsync({ groupId, data: expenseData });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add expense");
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      edges={["top"]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={isDark ? "#f1f5f9" : "#0f172a"}
              />
            </Pressable>
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              Add Group Expense
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1 px-5">
            {/* Amount Input */}
            <View className="items-center mb-8 mt-4">
              <Text
                className={`text-sm mb-2 ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Amount
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`text-4xl font-bold mr-1 ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                >
                  {getCurrencySymbol(group?.currency || "INR")}
                </Text>
                <TextInput
                  className={`text-5xl font-bold ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? "#4b5563" : "#cbd5e1"}
                  autoFocus
                />
              </View>
            </View>

            {/* Category Selection Carousel */}
            <View className="mb-6">
              <Text
                className={`text-sm font-bold mb-3 ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    className={`mr-3 items-center justify-center rounded-xl p-3 w-24 ${
                      category === cat.id
                        ? "bg-primary-500"
                        : isDark
                          ? "bg-slate-800"
                          : "bg-white border border-slate-200"
                    }`}
                  >
                    <MaterialIcons
                      name={cat.icon as any}
                      size={24}
                      color={
                        category === cat.id
                          ? "white"
                          : isDark
                            ? "#94a3b8"
                            : "#64748b"
                      }
                    />
                    <Text
                      className={`text-xs mt-2 font-medium ${
                        category === cat.id
                          ? "text-white"
                          : isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                      }`}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Description Input */}
            <View className="mb-6">
              <Text
                className={`text-sm font-bold mb-2 ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Description
              </Text>
              <View
                className={`flex-row items-center p-4 rounded-xl border ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={isDark ? "#94a3b8" : "#94a3b8"}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  className={`flex-1 text-base ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this for?"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                />
              </View>
            </View>

            {/* Date Input */}
            <View className="mb-8">
              <Text
                className={`text-sm font-bold mb-2 ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Date
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className={`flex-row items-center p-4 rounded-xl border ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <MaterialIcons
                  name="event"
                  size={20}
                  color={isDark ? "#94a3b8" : "#94a3b8"}
                  style={{ marginRight: 10 }}
                />
                <Text
                  className={`flex-1 text-base ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                >
                  {date.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>

            {/* Split Info Note */}
            <View className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-row items-start">
              <MaterialIcons
                name="info"
                size={20}
                color="#3b82f6"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text className="flex-1 text-sm text-blue-700 dark:text-blue-300">
                This expense will be split equally among all group members by
                default.
              </Text>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View
            className={`p-5 border-t ${
              isDark
                ? "bg-dark-bg border-slate-800"
                : "bg-white border-slate-100"
            }`}
          >
            <Pressable
              onPress={handleSubmit}
              disabled={addGroupExpense.isPending}
              className={`flex-row items-center justify-center p-4 rounded-xl ${
                addGroupExpense.isPending ? "bg-primary-300" : "bg-primary-500"
              }`}
            >
              {addGroupExpense.isPending ? (
                <ActivityIndicator color="white" className="mr-2" />
              ) : (
                <MaterialIcons
                  name="check"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-white font-bold text-lg">
                {addGroupExpense.isPending ? "Saving..." : "Save Expense"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
