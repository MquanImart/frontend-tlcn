import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface TabBarProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount: number;
}

const TabBar: React.FC<TabBarProps> = ({ selectedTab, onSelectTab, unreadCount }) => {
  useTheme();
  const tabs = ["Tất cả", "Chưa đọc", "Đã đọc"];

  return (
    <View style={[styles.tabsContainer, { backgroundColor: Color.background, borderBottomColor: Color.border }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, selectedTab === tab && styles.activeTab]}
          onPress={() => onSelectTab(tab)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === tab ? { color: Color.mainColor2, fontWeight: "bold" } : { color: Color.textSecondary }]}>
            {tab}
          </Text>
          {tab === "Chưa đọc" && unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: Color.error }]}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    position: "relative",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Color.mainColor2,
  },
  tabText: {
    fontSize: 16,
    textAlign: "center",
  },
  activeTabText: {
    // Colors handled inline for dynamic update
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  unreadCount: {
    color: "#fff", // Keeping white for contrast on badge
    fontSize: 12,
    fontWeight: "bold",
  },
});