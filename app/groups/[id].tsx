import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGroup, useGroupAnalytics } from "@/src/hooks/useGroups";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrencyAmount } from "@/src/utils/currency";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Fetch Group Details
  const {
    data: group,
    isLoading: isLoadingGroup,
    refetch: refetchGroup,
    error: groupError,
  } = useGroup(id!);

  // Fetch Group Analytics
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
  } = useGroupAnalytics(id!);

  const onRefresh = React.useCallback(() => {
    refetchGroup();
    refetchAnalytics();
  }, [refetchGroup, refetchAnalytics]);

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
        <View className="w-10" />
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
                key={member.id}
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
    </SafeAreaView>
  );
}
