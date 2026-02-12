import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: string; icon?: string; color?: string }[];
  onSelect: (value: string) => void;
  selectedValue?: string;
}

export default function SelectionModal({
  visible,
  onClose,
  title,
  options,
  onSelect,
  selectedValue,
}: SelectionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable
          className={`rounded-t-3xl max-h-[70%] ${
            isDark ? "bg-dark-card" : "bg-white"
          }`}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Text
              className={`text-lg font-bold ${
                isDark ? "text-dark-text" : "text-slate-900"
              }`}
            >
              {title}
            </Text>
            <Pressable onPress={onClose} className="p-1">
              <MaterialIcons
                name="close"
                size={24}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
            </Pressable>
          </View>

          {/* Options */}
          <ScrollView
            className="p-2"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className={`flex-row items-center p-4 rounded-xl mb-1 ${
                  selectedValue === option.value
                    ? isDark
                      ? "bg-primary-900/20"
                      : "bg-primary-50"
                    : ""
                }`}
              >
                {option.icon && (
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      isDark ? "bg-dark-bg" : "bg-white"
                    }`}
                  >
                    <MaterialIcons
                      name={option.icon as any}
                      size={20}
                      color={option.color || (isDark ? "#fff" : "#000")}
                    />
                  </View>
                )}
                <Text
                  className={`flex-1 text-base font-medium ${
                    selectedValue === option.value
                      ? "text-primary-500"
                      : isDark
                        ? "text-dark-text"
                        : "text-slate-700"
                  }`}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <MaterialIcons name="check" size={20} color="#10b981" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
