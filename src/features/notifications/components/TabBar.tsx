import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";

interface TabBarProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount: number;
}

const TabBar: React.FC<TabBarProps> = ({ selectedTab, onSelectTab, unreadCount }) => {
  const colors = getColor();
  const tabs = ["Tất cả", "Chưa đọc", "Đã đọc"];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, selectedTab === tab && styles.activeTab]}
          onPress={() => onSelectTab(tab)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
          {tab === "Chưa đọc" && unreadCount > 0 && (
            <View style={styles.unreadBadge}>
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
    borderBottomColor: getColor().borderColor1,
    backgroundColor: getColor().backGround,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    position: "relative", // Để đặt badge đúng vị trí
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: getColor().mainColor2,
  },
  tabText: {
    fontSize: 16,
    color: getColor().textColor3,
    textAlign: "center",
  },
  activeTabText: {
    color: getColor().mainColor2,
    fontWeight: "bold",
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: 20, // Điều chỉnh vị trí badge
    backgroundColor: "#F00",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
