import CIconButton from "@/src/shared/components/button/CIconButton";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import SearchGroup from "./SearchGroup";
import SearchUser from "./SearchUser";

type SearchUserAndGroupNavigationProp = StackNavigationProp<SearchStackParamList, "SearchUserAndGroup">;
type SearchUserAndGroupRouteProp = RouteProp<SearchStackParamList, "SearchUserAndGroup">;

interface SearchUserAndGroupProps {
  navigation: SearchUserAndGroupNavigationProp;
  route: SearchUserAndGroupRouteProp;
}

const SearchUserAndGroup: React.FC<SearchUserAndGroupProps> = ({ route, navigation }) => {
  useTheme();
  const { textSearch: initialTextSearch, userId } = route.params;
  const [searchText, setSearchText] = useState<string>(initialTextSearch || "");
  const [committedSearchText, setCommittedSearchText] = useState<string>(initialTextSearch || "");
  const tabs: TabProps[] = [
    { label: "Người dùng" },
    { label: "Nhóm" },
  ];

  const [currTab, setCurrTab] = useState<string>(tabs.length > 0 ? tabs[0].label : "");

  const handleSearchSubmit = () => {
    if (searchText.trim() === "") {
      setCommittedSearchText("");
      return;
    }
    setCommittedSearchText(searchText.trim());
  };

  const handleClearSearch = () => {
    setSearchText("");
    setCommittedSearchText("");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Color.background }]}>
      <View style={[styles.containerSearch, { backgroundColor: Color.background }]}>
        <CIconButton
          icon={<Ionicons name="arrow-back" size={24} color={Color.textPrimary} />}
          onSubmit={() => navigation.goBack()}
          style={{
            width: 40,
            height: 50,
            backColor: Color.background,
            textColor: Color.textPrimary,
            fontSize: 16,
            fontWeight: "normal",
            radius: 0,
            flex_direction: "row",
          }}
        />
        <View style={[styles.inputContainer, { backgroundColor: Color.backgroundTertiary }]}>
          <TextInput
            style={[styles.input, { color: Color.textPrimary }]}
            placeholder="Tìm kiếm người dùng hoặc nhóm"
            placeholderTextColor={Color.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Ionicons name="close" size={20} color={Color.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <CIconButton
          icon={<Ionicons name="search" size={24} color={Color.textPrimary} />}
          onSubmit={handleSearchSubmit}
          style={{
            width: 50,
            height: 50,
            backColor: Color.background,
            textColor: Color.textPrimary,
            fontSize: 16,
            fontWeight: "normal",
            radius: 20,
            flex_direction: "row",
          }}
        />
      </View>

      <View style={styles.tabContainer}>
        <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab} />
      </View>
      {currTab === tabs[0].label ? (
        <SearchUser textSearch={committedSearchText} userId={userId} navigation={navigation} />
      ) : (
        <SearchGroup textSearch={committedSearchText} userId={userId} navigation={navigation} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.background,
    borderRadius: 25,
    margin: 10,
    paddingHorizontal: 5,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.backgroundTertiary,
    borderRadius: 25,
    position: "relative",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingLeft: 10,
    borderRadius: 20,
    paddingRight: 40,
    backgroundColor: Color.backgroundTertiary,
  },
  clearButton: {
    position: "absolute",
    right: 5,
    padding: 10,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
  },
});

export default SearchUserAndGroup;