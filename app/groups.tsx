import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient from "@/src/api/axios";
import SelectionModal from "@/src/components/SelectionModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const CURRENCIES = [
  { code: "INR", label: "₹ INR — Indian Rupee" },
  { code: "USD", label: "$ USD — United States Dollar" },
  { code: "EUR", label: "€ EUR — Euro" },
  { code: "GBP", label: "£ GBP — British Pound" },
  { code: "JPY", label: "¥ JPY — Japanese Yen" },
  { code: "AUD", label: "$ AUD — Australian Dollar" },
  { code: "CAD", label: "$ CAD — Canadian Dollar" },
  { code: "CHF", label: "Fr CHF — Swiss Franc" },
  { code: "CNY", label: "¥ CNY — Chinese Yuan" },
  { code: "SEK", label: "kr SEK — Swedish Krona" },
  { code: "NZD", label: "$ NZD — New Zealand Dollar" },
  { code: "HKD", label: "$ HKD — Hong Kong Dollar" },
  { code: "SGD", label: "$ SGD — Singapore Dollar" },
  { code: "NOK", label: "kr NOK — Norwegian Krone" },
  { code: "KRW", label: "₩ KRW — South Korean Won" },
  { code: "MXN", label: "$ MXN — Mexican Peso" },
  { code: "BRL", label: "R$ BRL — Brazilian Real" },
  { code: "ZAR", label: "R ZAR — South African Rand" },
  { code: "TRY", label: "₺ TRY — Turkish Lira" },
  { code: "AED", label: "د.إ AED — UAE Dirham" },
  { code: "USD", label: "$ USD — United States Dollar" },
  { code: "EUR", label: "€ EUR — Euro" },
  { code: "GBP", label: "£ GBP — British Pound" },
  { code: "JPY", label: "¥ JPY — Japanese Yen" },
  { code: "AUD", label: "$ AUD — Australian Dollar" },
  { code: "CAD", label: "$ CAD — Canadian Dollar" },
  { code: "CHF", label: "Fr CHF — Swiss Franc" },
  { code: "CNY", label: "¥ CNY — Chinese Yuan" },
  { code: "SEK", label: "kr SEK — Swedish Krona" },
  { code: "NZD", label: "$ NZD — New Zealand Dollar" },
  { code: "HKD", label: "$ HKD — Hong Kong Dollar" },
  { code: "SGD", label: "$ SGD — Singapore Dollar" },
  { code: "NOK", label: "kr NOK — Norwegian Krone" },
  { code: "KRW", label: "₩ KRW — South Korean Won" },
  { code: "MXN", label: "$ MXN — Mexican Peso" },
  { code: "BRL", label: "R$ BRL — Brazilian Real" },
  { code: "ZAR", label: "R ZAR — South African Rand" },
  { code: "TRY", label: "₺ TRY — Turkish Lira" },
  { code: "AED", label: "د.إ AED — UAE Dirham" },
];

interface GroupMember {
  email: string;
  displayName: string;
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);

  const [currency, setCurrency] = useState("INR");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }

    setLoading(true);
    try {
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
          const msg =
            err?.response?.data?.message || `Failed to add ${member.email}`;
          Alert.alert("Warning", msg);
        }
      }

      Alert.alert(
        "Success",
        `Group "${groupName}" created with ${addedCount} member(s)!`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowCreate(false);
              setGroupName("");
              setGroupDescription("");
              setMembers([]);
            },
          },
        ],
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create group";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowCreate(false);
    setGroupName("");
    setGroupDescription("");
    setMembers([]);
    setMemberEmail("");
    setMemberName("");
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
          Split Expenses
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {!showCreate ? (
            /* Landing / Create button */
            <View className="flex-1 items-center justify-center pt-12">
              <View
                className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                  isDark ? "bg-dark-card" : "bg-primary-50"
                }`}
              >
                <MaterialIcons name="group-add" size={48} color="#10b981" />
              </View>
              <Text
                className={`text-xl font-bold mb-2 text-center ${
                  isDark ? "text-dark-text" : "text-slate-900"
                }`}
              >
                Split Expenses with Friends
              </Text>
              <Text
                className={`text-sm text-center mb-8 px-4 ${
                  isDark ? "text-dark-muted" : "text-slate-500"
                }`}
              >
                Create a group, add members, and track shared expenses together.
                Everyone gets their fair share!
              </Text>

              <Pressable
                onPress={() => setShowCreate(true)}
                className="bg-primary-500 px-8 py-4 rounded-2xl flex-row items-center"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <MaterialIcons name="add" size={22} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Create New Group
                </Text>
              </Pressable>

              {/* Feature highlights */}
              <View className="mt-10 w-full">
                {[
                  {
                    icon: "calculate" as const,
                    title: "Auto Split",
                    desc: "Expenses split equally among members",
                  },
                  {
                    icon: "track-changes" as const,
                    title: "Track Balances",
                    desc: "See who owes what in real time",
                  },
                  {
                    icon: "handshake" as const,
                    title: "Easy Settlement",
                    desc: "Settle up with one tap",
                  },
                ].map((item, i) => (
                  <View
                    key={i}
                    className={`flex-row items-center p-4 rounded-2xl mb-3 ${
                      isDark ? "bg-dark-card" : "bg-white"
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 1,
                    }}
                  >
                    <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center mr-3">
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color="#10b981"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${
                          isDark ? "text-dark-text" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className={`text-xs ${
                          isDark ? "text-dark-muted" : "text-slate-500"
                        }`}
                      >
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
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
                  name="attach-money"
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
                disabled={loading}
                className={`py-4 rounded-2xl items-center mb-3 ${
                  loading ? "bg-primary-300" : "bg-primary-500"
                }`}
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: loading ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: loading ? 0 : 4,
                }}
              >
                <Text className="text-white font-bold text-base">
                  {loading ? "Creating..." : "Create Group"}
                </Text>
              </Pressable>

              <Pressable
                onPress={resetForm}
                className="py-3 items-center"
                disabled={loading}
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
          label: `${c.label} (${c.code})`,
          value: c.code,
          icon: "attach-money",
        }))}
        onSelect={setCurrency}
        selectedValue={currency}
      />
    </SafeAreaView>
  );
}
