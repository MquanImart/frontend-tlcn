import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import SearchUser from "./SearchUser";
import SearchGroup from "./SearchGroup";
import { StackNavigationProp } from "@react-navigation/stack";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";

interface SearchUserAnhGroupProps {
  textSearch: string;
  userId: string;
  navigation: StackNavigationProp<SearchStackParamList, "Search">;
}

const SearchUserAnhGroup = ({ textSearch, userId, navigation }: SearchUserAnhGroupProps) => {
  const tabs: TabProps[] = [
    { label: "Người dùng" },
    { label: "Nhóm" },
  ];

  const [currTab, setCurrTab] = useState<string>(tabs.length > 0 ? tabs[0].label : "");

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab} />
      </View>
      {currTab === tabs[0].label ? (
        <SearchUser textSearch={textSearch} userId={userId} navigation={navigation} />
      ) : (
        <SearchGroup textSearch={textSearch} userId={userId} navigation={navigation}/>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 40,
  },
});

export default SearchUserAnhGroup;