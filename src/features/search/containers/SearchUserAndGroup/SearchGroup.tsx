// src/features/search/containers/SearchGroup/SearchGroup.tsx
import GroupCard from "@/src/features/group/components/GroupCard";
import { useExplore } from "@/src/features/group/containers/group/tabs/useExplore";
import { useJoinedGroups } from "@/src/features/group/containers/group/tabs/useJoinedGroups";
import { useMyGroups } from "@/src/features/group/containers/group/tabs/useMyGroups";
import CButton from "@/src/shared/components/button/CButton";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface SearchGroupProps {
  textSearch: string;
  userId: string;
  navigation: StackNavigationProp<SearchStackParamList, "SearchUserAndGroup">;
}

const SearchGroup: React.FC<SearchGroupProps> = ({ textSearch, userId, navigation }) => {
  useTheme()
  const { myGroups, loading: myGroupsLoading, error: myGroupsError } = useMyGroups(userId);
  const { savedGroups, loading: joinedGroupsLoading, error: joinedGroupsError } = useJoinedGroups(userId);
  const { groupsNotJoined, loading: exploreLoading, error: exploreError, handleJoinGroup } = useExplore(userId);

  const [visibleMyGroupsCount, setVisibleMyGroupsCount] = useState(3);
  const [visibleJoinedGroupsCount, setVisibleJoinedGroupsCount] = useState(3);
  const [visibleNotJoinedGroupsCount, setVisibleNotJoinedGroupsCount] = useState(3);

  const normalizedSearch = removeVietnameseTones(textSearch);

  const filterGroups = (groups: any[]) =>
    groups.filter((group) => {
      if (!group.groupName) return false;
      const normalizedName = removeVietnameseTones(group.groupName);
      return normalizedName.includes(normalizedSearch);
    });

  const filteredMyGroups = filterGroups(myGroups);
  const filteredJoinedGroups = filterGroups(savedGroups);
  const filteredNotJoinedGroups = filterGroups(groupsNotJoined);

  const loading = myGroupsLoading || joinedGroupsLoading || exploreLoading;
  const error = [myGroupsError, joinedGroupsError, exploreError].filter((err) => err).join("; ") || null;

  const onJoinGroup = (groupId: string) => {
    handleJoinGroup(groupId).catch((err) => {
      console.error("Lỗi khi tham gia nhóm:", err);
    });
  };

  const noopJoinGroup = (groupId: string) => {};

  const renderGroupSection = (
    groups: any[],
    visibleCount: number,
    setVisibleCount: (count: number) => void,
    allowJoin: boolean = false
  ) => (
    <>
      {groups.slice(0, visibleCount).map((item) => (
        <GroupCard
          key={item._id}
          group={item}
          currentUserId={userId}
          onJoinGroup={allowJoin ? onJoinGroup : noopJoinGroup}
          onViewGroup={() =>
            navigation.navigate("GroupDetailsScreen", {
              groupId: item._id,
              currentUserId: userId,
            })
          }
        />
      ))}
      {visibleCount < groups.length && (
        <View style={styles.buttonContainer}>
          <CButton
            label="Xem thêm"
            onSubmit={() => setVisibleCount(visibleCount + 3)}
            style={{
              width: "100%",
              height: 50,
              backColor: Color.mainColor1,
              textColor: Color.white_homologous,
              fontSize: 16,
              fontWeight: "bold",
              radius: 25,
              flex_direction: "row",
            }}
          />
        </View>
      )}
    </>
  );

  const totalGroups = filteredMyGroups.length + filteredJoinedGroups.length + filteredNotJoinedGroups.length;

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : totalGroups === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {textSearch ? `Không tìm thấy nhóm nào cho "${textSearch}"` : "Không tìm thấy nhóm"}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderGroupSection(
            filteredMyGroups,
            visibleMyGroupsCount,
            setVisibleMyGroupsCount,
            false
          )}
          {renderGroupSection(
            filteredJoinedGroups,
            visibleJoinedGroupsCount,
            setVisibleJoinedGroupsCount,
            false
          )}
          {renderGroupSection(
            filteredNotJoinedGroups,
            visibleNotJoinedGroupsCount,
            setVisibleNotJoinedGroupsCount,
            true
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: Color.backGround,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Color.textColor3,
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default SearchGroup;