import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient from "@/src/api/axios";
import {
  useGroup,
  useGroupAnalytics,
  useGroupExpenses,
} from "@/src/hooks/useGroups";
import { useAuthStore } from "@/src/store/auth.store";
import { formatCurrencyAmount } from "@/src/utils/currency";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch Group Details
  const {
    data: group,
    isLoading: isLoadingGroup,
    refetch: refetchGroup,
    error: groupError,
  } = useGroup(id!);

  /* Fetch Group Analytics */
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
  } = useGroupAnalytics(id!);

  // Fetch Group Expenses
  const {
    data: expenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useGroupExpenses(id!);

  const onRefresh = React.useCallback(() => {
    refetchGroup();
    refetchAnalytics();
    refetchExpenses();
  }, [refetchGroup, refetchAnalytics, refetchExpenses]);

  React.useEffect(() => {
    if (group) {
      setEditName(group.name);
      setEditDescription(group.description || "");
    }
  }, [group]);

  const handleDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone and will remove all members and expenses.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/groups/${id}`);
              queryClient.invalidateQueries({ queryKey: ["groups"] });
              Alert.alert("Success", "Group deleted successfully");
              router.replace("/groups");
            } catch (error: any) {
              const msg =
                error?.response?.data?.message || "Failed to delete group";
              Alert.alert("Error", msg);
            }
          },
        },
      ],
    );
  };

  const handleUpdateGroup = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiClient.put(`/groups/${id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      if (res.data.status === "success") {
        await refetchGroup();
        setIsEditModalVisible(false);
        queryClient.invalidateQueries({ queryKey: ["groups"] }); // Update list as well
        Alert.alert("Success", "Group updated successfully");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update group";
      Alert.alert("Error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!group) return;
    try {
      const result = await Share.share({
        message: `Join my group "${group.name}" on SpendWise! Use code: ${group.code}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleAddExpense = () => {
    router.push({
      pathname: "/groups/add-expense" as any,
      params: { groupId: id },
    });
  };

  const isLoading = isLoadingGroup || isLoadingAnalytics;

  if (isLoading && !group) {
    return (
      <SafeAreaView
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-dark-bg" : "bg-slate-50"
        }`}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  if (groupError || !group) {
    return (
      <SafeAreaView
        className={`flex-1 justify-center items-center px-6 ${
          isDark ? "bg-dark-bg" : "bg-slate-50"
        }`}
      >
        <MaterialIcons
          name="error-outline"
          size={48}
          color={isDark ? "#ef4444" : "#ef4444"}
        />
        <Text
          className={`text-lg font-bold mt-4 mb-2 ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
        >
          Failed to load group
        </Text>
        <Pressable
          onPress={onRefresh}
          className="bg-primary-500 px-6 py-3 rounded-xl mt-4"
        >
          <Text className="text-white font-bold">Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-bg" : "bg-slate-50"}`}
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#f1f5f9" : "#0f172a"}
          />
        </Pressable>
        <Text
          className={`text-xl font-bold ${
            isDark ? "text-dark-text" : "text-slate-900"
          }`}
        >
          Group Details
        </Text>

        {group && user && group.created_by === user.id ? (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setIsEditModalVisible(true)}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800"
            >
              <MaterialIcons
                name="edit"
                size={22}
                color={isDark ? "#f1f5f9" : "#0f172a"}
              />
            </Pressable>
            <Pressable
              onPress={handleDeleteGroup}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-red-100 dark:active:bg-red-900/30"
            >
              <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
            </Pressable>
          </View>
        ) : (
          <View className="w-10" />
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
      >
        {/* Group Info Card */}
        <View
          className={`p-5 rounded-2xl mb-6 ${
            isDark ? "bg-dark-card" : "bg-white"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {group.name}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${
                isDark ? "bg-primary-900" : "bg-primary-50"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isDark ? "text-primary-300" : "text-primary-700"
                }`}
              >
                {group.currency}
              </Text>
            </View>
          </View>

          {group.description && (
            <Text
              className={`text-sm mb-4 ${
                isDark ? "text-dark-muted" : "text-slate-500"
              }`}
            >
              {group.description}
            </Text>
          )}

          <View className="flex-row items-center mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <View className="flex-1 items-center">
              <Text
                className={`text-2xl font-bold mb-1 ${
                  isDark ? "text-dark-text" : "text-slate-900"
                }`}
              >
                {formatCurrencyAmount(
                  analytics?.totalExpenses || 0,
                  group.currency || "INR",
                )}
              </Text>
              <Text
                className={`text-xs ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Total Expenses
              </Text>
            </View>
            <View className="w-[1px] h-10 bg-slate-200 dark:bg-slate-700" />
            <View className="flex-1 items-center">
              <Text
                className={`text-2xl font-bold mb-1 ${
                  isDark ? "text-dark-text" : "text-slate-900"
                }`}
              >
                {group.totalMembers}
              </Text>
              <Text
                className={`text-xs ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Members
              </Text>
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View className="mb-6">
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-dark-text" : "text-slate-900"
            }`}
          >
            Members
          </Text>

          <View
            className={`rounded-2xl overflow-hidden ${
              isDark ? "bg-dark-card" : "bg-white"
            }`}
          >
            {group.members.map((member, index) => (
              <View
                key={member.userId}
                className={`flex-row items-center p-4 ${
                  index !== group.members.length - 1
                    ? "border-b border-slate-100 dark:border-slate-800"
                    : ""
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                  <Text className="text-primary-600 text-lg font-bold">
                    {member.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className={`font-semibold mr-2 ${
                        isDark ? "text-dark-text" : "text-slate-900"
                      }`}
                    >
                      {member.displayName}
                    </Text>
                    {member.role === "admin" && (
                      <View className="bg-amber-100 px-1.5 py-0.5 rounded">
                        <Text className="text-[10px] font-bold text-amber-700">
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-dark-muted" : "text-slate-500"
                    }`}
                  >
                    {member.email}
                  </Text>
                </View>

                {analytics?.memberBalances[member.userId] !== undefined && (
                  <View className="items-end">
                    <Text
                      className={`font-bold ${
                        analytics.memberBalances[member.userId] > 0
                          ? "text-emerald-500"
                          : analytics.memberBalances[member.userId] < 0
                            ? "text-red-500"
                            : isDark
                              ? "text-slate-400"
                              : "text-slate-500"
                      }`}
                    >
                      {analytics.memberBalances[member.userId] > 0 ? "+" : ""}
                      {formatCurrencyAmount(
                        analytics.memberBalances[member.userId],
                        group.currency || "INR",
                      )}
                    </Text>
                    <Text
                      className={`text-[10px] ${
                        isDark ? "text-dark-muted" : "text-slate-400"
                      }`}
                    >
                      Balance
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Group Expenses Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              Recent Expenses
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/groups/group-expenses" as any,
                  params: { groupId: id },
                })
              }
            >
              <Text className="text-primary-500 font-bold">See All</Text>
            </Pressable>
          </View>

          <View
            className={`rounded-2xl overflow-hidden ${
              isDark ? "bg-dark-card" : "bg-white"
            }`}
          >
            {expensesLoading ? (
              <View className="p-4 items-center">
                <ActivityIndicator
                  size="small"
                  color={isDark ? "white" : "black"}
                />
              </View>
            ) : expenses?.length === 0 ? (
              <View className="p-4 items-center">
                <Text className={isDark ? "text-slate-400" : "text-slate-500"}>
                  No expenses yet.
                </Text>
              </View>
            ) : (
              expenses?.map((expense, index) => (
                <View
                  key={expense.id}
                  className={`flex-row items-center p-4 ${
                    index !== (expenses?.length || 0) - 1
                      ? "border-b border-slate-100 dark:border-slate-800"
                      : ""
                  }`}
                >
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <MaterialIcons name="receipt" size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        isDark ? "text-dark-text" : "text-slate-900"
                      }`}
                    >
                      {expense.description}
                    </Text>
                    <Text
                      className={`text-xs ${
                        isDark ? "text-dark-muted" : "text-slate-500"
                      }`}
                    >
                      {new Date(expense.date).toLocaleDateString()} • by{" "}
                      {group.members.find((m) => m.userId === expense.paidBy)
                        ?.displayName || "Unknown"}
                    </Text>
                  </View>
                  <Text
                    className={`font-bold ${
                      isDark ? "text-dark-text" : "text-slate-900"
                    }`}
                  >
                    {formatCurrencyAmount(
                      expense.amount,
                      expense.currency || group.currency || "INR",
                    )}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Actions Placeholder */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleAddExpense}
            className="flex-1 bg-primary-500 py-4 rounded-xl items-center flex-row justify-center"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Add Expense</Text>
          </Pressable>

          <Pressable
            onPress={handleInvite}
            className={`flex-1 py-4 rounded-xl items-center flex-row justify-center border ${
              isDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <MaterialIcons
              name="person-add"
              size={20}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <Text
              className={`font-bold ml-2 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Invite
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View
              className={`rounded-t-3xl p-6 ${isDark ? "bg-dark-card" : "bg-white"}`}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-slate-900"}`}
                >
                  Edit Group
                </Text>
                <Pressable onPress={() => setIsEditModalVisible(false)}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                </Pressable>
              </View>

              <Text
                className={`text-sm font-semibold mb-1.5 ${isDark ? "text-dark-text" : "text-slate-700"}`}
              >
                Group Name *
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Group Name"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className={`px-4 py-3 rounded-xl mb-4 ${isDark ? "bg-dark-bg text-dark-text" : "bg-slate-50 text-slate-900"}`}
              />

              <Text
                className={`text-sm font-semibold mb-1.5 ${isDark ? "text-dark-text" : "text-slate-700"}`}
              >
                Description
              </Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className={`px-4 py-3 rounded-xl mb-6 ${isDark ? "bg-dark-bg text-dark-text" : "bg-slate-50 text-slate-900"}`}
              />

              <Pressable
                onPress={handleUpdateGroup}
                disabled={isSaving}
                className={`py-4 rounded-xl items-center mb-6 ${isSaving ? "bg-primary-300" : "bg-primary-500"}`}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Save Changes
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
