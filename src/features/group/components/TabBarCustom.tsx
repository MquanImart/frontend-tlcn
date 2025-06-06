import getColor from "@/src/styles/Color";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Color = getColor();

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
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.label}
          style={[
            styles.tab,
            selectedTab === tab.label
              ? [styles.activeTab, activeTabStyle]
              : [styles.inactiveTab, inactiveTabStyle],
          ]}
          onPress={() => onSelectTab(tab.label)}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={selectedTab === tab.label ? Color.textColor2 : Color.textColor3}
          />
          {selectedTab === tab.label && (
            <Text style={[styles.activeText, activeTextStyle]}>{tab.label}</Text>
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
    backgroundColor: Color.backGround,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: Color.mainColor1,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  activeText: {
    color: Color.textColor2,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  inactiveText: {
    color: Color.textColor3,
    fontSize: 14,
  },
});
