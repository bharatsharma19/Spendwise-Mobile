import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient from "@/src/api/axios";
import SelectionModal from "@/src/components/SelectionModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CURRENCIES = [
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
];

interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  totalMembers: number;
  totalExpenses: number;
  createdBy: string;
}

interface GroupMember {
  email: string;
  displayName: string;
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);

  const [currency, setCurrency] = useState("INR");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Fetch Groups
  const {
    data: groups,
    isLoading: isLoadingGroups,
    refetch,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await apiClient.get("/groups");
      return res.data.data as Group[];
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      // 1. Create the group
      const groupRes = await apiClient.post("/groups", {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        currency: currency,
      });

      const groupId = groupRes.data?.data?.id;
      if (!groupId) throw new Error("Failed to get group ID");

      // 2. Add each member
      let addedCount = 0;
      for (const member of members) {
        try {
          await apiClient.post(`/groups/${groupId}/members`, {
            email: member.email,
            displayName: member.displayName,
          });
          addedCount++;
        } catch (err: any) {
          console.warn(`Failed to add ${member.email}`, err);
        }
      }
      return { groupName: groupName.trim(), addedCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      // Reset form
      setShowCreate(false);
      setGroupName("");
      setGroupDescription("");
      setMembers([]);
      setMemberEmail("");
      setMemberName("");
      setCurrency("INR");

      Alert.alert(
        "Success",
        `Group "${data.groupName}" created with ${data.addedCount} member(s)!`,
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create group";
      Alert.alert("Error", msg);
    },
  });

  const addMember = () => {
    if (!memberEmail.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(memberEmail)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }
    if (members.some((m) => m.email === memberEmail.trim().toLowerCase())) {
      Alert.alert("Error", "Member already added");
      return;
    }
    setMembers([
      ...members,
      {
        email: memberEmail.trim().toLowerCase(),
        displayName: memberName.trim() || memberEmail.trim(),
      },
    ]);
    setMemberEmail("");
    setMemberName("");
  };

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }
    createGroupMutation.mutate();
  };

  const resetForm = () => {
    setShowCreate(false);
    setGroupName("");
    setGroupDescription("");
    setMembers([]);
    setMemberEmail("");
    setMemberName("");
    setCurrency("INR");
  };

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
          {showCreate ? "Create Group" : "Your Groups"}
        </Text>
        {!showCreate && (
          <Pressable onPress={() => setShowCreate(true)}>
            <MaterialIcons
              name="add"
              size={28}
              color={isDark ? "#10b981" : "#10b981"}
            />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isLoadingGroups} onRefresh={refetch} />
          }
        >
          {!showCreate ? (
            /* Groups List */
            <View>
              {groups && groups.length > 0 ? (
                groups.map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => router.push(`/groups/${group.id}` as any)} // Navigate to details (if implemented later) or just show info
                    className={`p-4 rounded-2xl mb-3 ${
                      isDark ? "bg-dark-card" : "bg-white"
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        className={`text-lg font-bold ${isDark ? "text-dark-text" : "text-slate-900"}`}
                      >
                        {group.name}
                      </Text>
                      <Text
                        className={`text-xs px-2 py-1 rounded-full font-bold ${isDark ? "bg-primary-900 text-primary-300" : "bg-primary-50 text-primary-700"}`}
                      >
                        {group.currency}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm mb-3 ${isDark ? "text-dark-muted" : "text-slate-500"}`}
                    >
                      {group.description || "No description"}
                    </Text>
                    <View className="flex-row items-center justify-between border-t border-dashed border-gray-100 dark:border-gray-800 pt-3">
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="person"
                          size={16}
                          color={isDark ? "#94a3b8" : "#64748b"}
                        />
                        <Text
                          className={`ml-1 text-xs ${isDark ? "text-dark-muted" : "text-slate-500"}`}
                        >
                          {group.totalMembers} Members
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="receipt"
                          size={16}
                          color={isDark ? "#94a3b8" : "#64748b"}
                        />
                        <Text
                          className={`ml-1 text-xs ${isDark ? "text-dark-muted" : "text-slate-500"}`}
                        >
                          {group.totalExpenses} Expenses
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View className="items-center justify-center py-20">
                  <View
                    className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isDark ? "bg-dark-card" : "bg-slate-100"}`}
                  >
                    <MaterialIcons
                      name="group-off"
                      size={40}
                      color={isDark ? "#475569" : "#94a3b8"}
                    />
                  </View>
                  <Text
                    className={`text-lg font-semibold mb-2 ${isDark ? "text-dark-text" : "text-slate-900"}`}
                  >
                    No groups yet
                  </Text>
                  <Text
                    className={`text-center px-10 ${isDark ? "text-dark-muted" : "text-slate-500"}`}
                  >
                    Create a group to start splitting expenses with your
                    friends!
                  </Text>
                  <Pressable
                    onPress={() => setShowCreate(true)}
                    className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-bold">
                      Create First Group
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            /* Create Group Form */
            <View className="pt-4">
              {/* Group Name */}
              <Text
                className={`text-sm font-semibold mb-1.5 ${
                  isDark ? "text-dark-text" : "text-slate-700"
                }`}
              >
                Group Name *
              </Text>
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g., Weekend Trip, Flatmates"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className={`px-4 py-3 rounded-xl mb-4 ${
                  isDark
                    ? "bg-dark-card text-dark-text"
                    : "bg-white text-slate-900"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />

              {/* Description */}
              <Text
                className={`text-sm font-semibold mb-1.5 ${
                  isDark ? "text-dark-text" : "text-slate-700"
                }`}
              >
                Description (optional)
              </Text>
              <TextInput
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Brief description..."
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                className={`px-4 py-3 rounded-xl mb-6 ${
                  isDark
                    ? "bg-dark-card text-dark-text"
                    : "bg-white text-slate-900"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />

              {/* Currency Selector */}
              <Text
                className={`text-sm font-semibold mb-1.5 ${
                  isDark ? "text-dark-text" : "text-slate-700"
                }`}
              >
                Currency
              </Text>
              <Pressable
                onPress={() => setShowCurrencyModal(true)}
                className={`flex-row items-center px-4 py-3 rounded-xl mb-6 ${
                  isDark ? "bg-dark-card" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <MaterialIcons
                  name="currency-exchange"
                  size={20}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
                <Text
                  className={`flex-1 ml-3 text-base ${
                    isDark ? "text-dark-text" : "text-slate-900"
                  }`}
                >
                  {CURRENCIES.find((c) => c.code === currency)?.label ||
                    currency}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              </Pressable>

              {/* Add Members */}
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-dark-text" : "text-slate-700"
                }`}
              >
                Add Members
              </Text>

              <View
                className={`p-4 rounded-xl mb-4 ${
                  isDark ? "bg-dark-card" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <TextInput
                  value={memberName}
                  onChangeText={setMemberName}
                  placeholder="Name (optional)"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  className={`px-3 py-2.5 rounded-lg mb-2 ${
                    isDark
                      ? "bg-dark-bg text-dark-text"
                      : "bg-slate-50 text-slate-900"
                  }`}
                />
                <View className="flex-row items-center">
                  <TextInput
                    value={memberEmail}
                    onChangeText={setMemberEmail}
                    placeholder="Email address *"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`flex-1 px-3 py-2.5 rounded-lg mr-2 ${
                      isDark
                        ? "bg-dark-bg text-dark-text"
                        : "bg-slate-50 text-slate-900"
                    }`}
                  />
                  <Pressable
                    onPress={addMember}
                    className="bg-primary-500 w-10 h-10 rounded-xl items-center justify-center"
                  >
                    <MaterialIcons name="add" size={22} color="#fff" />
                  </Pressable>
                </View>
              </View>

              {/* Members List */}
              {members.length > 0 && (
                <View className="mb-6">
                  <Text
                    className={`text-xs mb-2 ${
                      isDark ? "text-dark-muted" : "text-slate-500"
                    }`}
                  >
                    {members.length} member(s) added
                  </Text>
                  {members.map((m) => (
                    <View
                      key={m.email}
                      className={`flex-row items-center py-3 px-3 rounded-xl mb-2 ${
                        isDark ? "bg-dark-card" : "bg-white"
                      }`}
                    >
                      <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-3">
                        <Text className="text-primary-600 text-sm font-bold">
                          {m.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`text-sm font-medium ${
                            isDark ? "text-dark-text" : "text-slate-900"
                          }`}
                        >
                          {m.displayName}
                        </Text>
                        <Text
                          className={`text-xs ${
                            isDark ? "text-dark-muted" : "text-slate-500"
                          }`}
                        >
                          {m.email}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeMember(m.email)}>
                        <MaterialIcons name="close" size={18} color="#ef4444" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <Pressable
                onPress={handleCreateGroup}
                disabled={createGroupMutation.isPending}
                className={`py-4 rounded-2xl items-center mb-3 ${
                  createGroupMutation.isPending
                    ? "bg-primary-300"
                    : "bg-primary-500"
                }`}
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: createGroupMutation.isPending ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: createGroupMutation.isPending ? 0 : 4,
                }}
              >
                <Text className="text-white font-bold text-base">
                  {createGroupMutation.isPending
                    ? "Creating..."
                    : "Create Group"}
                </Text>
              </Pressable>

              <Pressable
                onPress={resetForm}
                className="py-3 items-center"
                disabled={createGroupMutation.isPending}
              >
                <Text
                  className={`font-semibold ${
                    isDark ? "text-dark-muted" : "text-slate-500"
                  }`}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <SelectionModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Select Group Currency"
        options={CURRENCIES.map((c) => ({
          label: `${c.label} (${c.symbol})`,
          value: c.code,
        }))}
        onSelect={setCurrency}
        selectedValue={currency}
      />
    </SafeAreaView>
  );
}
