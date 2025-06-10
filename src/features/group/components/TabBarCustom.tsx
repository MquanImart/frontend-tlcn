// src/shared/components/tabbar/TabBarCustom.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';


export interface Tab {
  label: string;
  icon: string;
}

interface TabBarProps {
  tabs: Tab[];
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  style?: object;
  activeTabStyle?: object;
  inactiveTabStyle?: object;
  activeTextStyle?: object;
  inactiveTextStyle?: object;
}

const TabBarCustom: React.FC<TabBarProps> = ({
  tabs,
  selectedTab,
  onSelectTab,
  style = {},
  activeTabStyle = {},
  inactiveTabStyle = {},
  activeTextStyle = {},
  inactiveTextStyle = {},
}) => {
  useTheme(); // Call useTheme() to ensure dynamic colors are applied
  return (
    <View style={[styles.container, { backgroundColor: Color.backgroundSecondary }, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.label}
          style={[
            styles.tab,
            selectedTab === tab.label
              ? [styles.activeTab, { backgroundColor: Color.mainColor2 }, activeTabStyle] // Active tab background
              : [styles.inactiveTab, inactiveTabStyle], // Inactive tab background (transparent)
          ]}
          onPress={() => onSelectTab(tab.label)}
        >
          <Icon
            name={tab.icon}
            size={24}
            // Icon color: textOnMain2 for active, textSecondary for inactive
            color={selectedTab === tab.label ? Color.textOnMain2 : Color.textSecondary}
          />
          {selectedTab === tab.label && (
            // Text color for active tab: textOnMain2
            <Text style={[styles.activeText, { color: Color.textOnMain2 }, activeTextStyle]}>{tab.label}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabBarCustom;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // backgroundColor: Color.background, // Moved to inline style for backgroundSecondary
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
    elevation: 5,
    shadowColor: "#000", // Keep fixed shadow color for consistent appearance
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10, // Adjusted from 10 to 16 for better padding consistency
    paddingVertical: 8,    // Adjusted from 10 to 8
    borderRadius: 15, // Adjusted from 10 to 15 for a softer look
  },
  activeTab: {
    // backgroundColor is applied inline
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  activeText: {
    // color is applied inline
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5, // Adjusted from 5 to 8 for better spacing
  },
  inactiveText: {
    // color is applied inline
    fontSize: 14,
  },
});