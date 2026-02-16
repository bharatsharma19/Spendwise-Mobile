import { useColorScheme } from "@/hooks/use-color-scheme";
import { AddGroupExpenseDto } from "@/src/api/group.api";
import { useAddGroupExpense, useGroup } from "@/src/hooks/useGroups";
import { getCurrencySymbol } from "@/src/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [splitType, setSplitType] = useState<"equal" | "specific">("equal");
  const [selectedSdkIds, setSelectedSdkIds] = useState<string[]>([]); // User IDs

  React.useEffect(() => {
    if (group?.members) {
      // Default to all members selected initially
      setSelectedSdkIds(group.members.map((m) => m.userId));
    }
  }, [group?.members]);

  const toggleMemberSelection = (userId: string) => {
    if (selectedSdkIds.includes(userId)) {
      setSelectedSdkIds((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedSdkIds((prev) => [...prev, userId]);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!groupId) {
      Alert.alert("Error", "Group ID is missing");
      return;
    }

    const totalAmount = parseFloat(amount);
    let splits: { userId: string; amount: number }[] | undefined;

    if (splitType === "specific") {
      if (selectedSdkIds.length === 0) {
        Alert.alert("Error", "Please select at least one member to split with");
        return;
      }

      const count = selectedSdkIds.length;
      const baseAmount = Math.floor((totalAmount * 100) / count) / 100;
      const remainder = Math.round(
        totalAmount * 100 - baseAmount * 100 * count,
      );

      splits = selectedSdkIds.map((userId, index) => ({
        userId,
        amount:
          index < remainder
            ? Number((baseAmount + 0.01).toFixed(2))
            : baseAmount,
      }));
    }

    const expenseData: AddGroupExpenseDto = {
      amount: totalAmount,
      currency: group?.currency || "INR",
      category,
      description: description.trim() || undefined,
      date: date.toISOString(),
      splits,
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

        <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
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

          {/* Split Section */}
          <View className="mb-6">
            <Text
              className={`text-sm font-bold mb-3 ${isDark ? "text-dark-muted" : "text-slate-500"}`}
            >
              Split With
            </Text>

            <View className="flex-row mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <Pressable
                onPress={() => setSplitType("equal")}
                className={`flex-1 py-2 items-center rounded-lg ${splitType === "equal" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
              >
                <Text
                  className={`font-semibold ${splitType === "equal" ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Equally
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSplitType("specific")}
                className={`flex-1 py-2 items-center rounded-lg ${splitType === "specific" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
              >
                <Text
                  className={`font-semibold ${splitType === "specific" ? (isDark ? "text-white" : "text-slate-900") : isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Specific Members
                </Text>
              </Pressable>
            </View>

            {splitType === "specific" && (
              <View
                className={`rounded-xl overflow-hidden border ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
              >
                {group?.members.map((member, index) => {
                  const isSelected = selectedSdkIds.includes(member.userId);
                  return (
                    <Pressable
                      key={member.userId}
                      onPress={() => toggleMemberSelection(member.userId)}
                      className={`flex-row items-center p-3 ${index !== group.members.length - 1 ? (isDark ? "border-b border-slate-800" : "border-b border-slate-100") : ""}`}
                    >
                      <View
                        className={`w-5 h-5 rounded border mr-3 items-center justify-center ${isSelected ? "bg-primary-500 border-primary-500" : isDark ? "border-slate-600" : "border-slate-300"}`}
                      >
                        {isSelected && (
                          <MaterialIcons name="check" size={14} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {member.displayName}
                        </Text>
                        <Text
                          className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {member.email}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {splitType === "equal" && (
              <View className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-row items-start">
                <MaterialIcons
                  name="info"
                  size={20}
                  color="#3b82f6"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <Text className="flex-1 text-sm text-blue-700 dark:text-blue-300">
                  This expense will be split equally among all group members.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          className={`p-5 border-t ${
            isDark ? "bg-dark-bg border-slate-800" : "bg-white border-slate-100"
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
    </SafeAreaView>
  );
}
