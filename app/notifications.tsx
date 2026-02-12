import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient from "@/src/api/axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/users/notifications");
      setNotifications(response.data?.data || []);
    } catch {
      // If endpoint returns error, show empty state
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/users/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      // Silently fail
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/users/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getIconForType = (
    type: string,
  ): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case "expense":
        return "receipt-long";
      case "budget":
        return "account-balance-wallet";
      case "group":
        return "group";
      case "reminder":
        return "alarm";
      default:
        return "notifications";
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable
      onPress={() => markAsRead(item.id)}
      onLongPress={() =>
        Alert.alert("Delete", "Remove this notification?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteNotification(item.id),
          },
        ])
      }
      className={`mx-5 mb-3 p-4 rounded-2xl ${
        item.is_read
          ? isDark
            ? "bg-dark-card"
            : "bg-white"
          : isDark
            ? "bg-dark-card border-l-4 border-primary-500"
            : "bg-primary-50 border-l-4 border-primary-500"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <View className="flex-row items-start">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            item.is_read
              ? isDark
                ? "bg-dark-bg"
                : "bg-slate-100"
              : "bg-primary-100"
          }`}
        >
          <MaterialIcons
            name={getIconForType(item.type)}
            size={20}
            color={item.is_read ? (isDark ? "#64748b" : "#94a3b8") : "#10b981"}
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
            className={`text-xs mt-1 leading-4 ${
              isDark ? "text-dark-muted" : "text-slate-500"
            }`}
          >
            {item.message}
          </Text>
          <Text
            className={`text-xs mt-2 ${
              isDark ? "text-dark-muted" : "text-slate-400"
            }`}
          >
            {getTimeSince(item.created_at)}
          </Text>
        </View>
        {!item.is_read && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1" />
        )}
      </View>
    </Pressable>
  );

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
          Notifications
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className={isDark ? "text-dark-muted" : "text-slate-400"}>
            Loading...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              isDark ? "bg-dark-card" : "bg-slate-100"
            }`}
          >
            <MaterialIcons
              name="notifications-off"
              size={36}
              color={isDark ? "#475569" : "#94a3b8"}
            />
          </View>
          <Text
            className={`text-lg font-semibold mb-2 ${
              isDark ? "text-dark-text" : "text-slate-700"
            }`}
          >
            No notifications
          </Text>
          <Text
            className={`text-sm text-center ${
              isDark ? "text-dark-muted" : "text-slate-400"
            }`}
          >
            {"You're all caught up! New notifications will appear here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
