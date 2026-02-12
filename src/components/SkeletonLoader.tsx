import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

function SkeletonItem({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
}: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{
        width: width as number,
        height,
        borderRadius,
        backgroundColor: isDark ? "#334155" : "#e2e8f0",
        opacity,
      }}
    />
  );
}

export function ExpenseCardSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${
        isDark ? "bg-dark-card" : "bg-white"
      }`}
    >
      <SkeletonItem width={48} height={48} borderRadius={12} className="mr-3" />
      <View className="flex-1">
        <SkeletonItem width="60%" height={16} className="mb-2" />
        <SkeletonItem width="40%" height={12} />
      </View>
      <SkeletonItem width={70} height={18} />
    </View>
  );
}

export function DashboardSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="px-5 pt-4">
      {/* Header skeleton */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <SkeletonItem width={120} height={14} className="mb-2" />
          <SkeletonItem width={160} height={22} />
        </View>
        <SkeletonItem width={44} height={44} borderRadius={22} />
      </View>

      {/* Summary cards */}
      <View
        className={`p-5 rounded-2xl mb-4 ${isDark ? "bg-dark-card" : "bg-white"}`}
      >
        <SkeletonItem width={100} height={14} className="mb-3" />
        <SkeletonItem width={180} height={32} className="mb-2" />
        <SkeletonItem width={140} height={12} />
      </View>

      {/* Category section */}
      <SkeletonItem width={140} height={18} className="mb-4" />
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className={`p-4 rounded-2xl flex-1 min-w-[45%] ${
              isDark ? "bg-dark-card" : "bg-white"
            }`}
          >
            <SkeletonItem
              width={36}
              height={36}
              borderRadius={10}
              className="mb-3"
            />
            <SkeletonItem width="70%" height={12} className="mb-2" />
            <SkeletonItem width="50%" height={16} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default SkeletonItem;
