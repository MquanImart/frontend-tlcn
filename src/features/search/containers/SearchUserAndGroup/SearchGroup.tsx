import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import GroupCard from "@/src/features/group/components/GroupCard";
import CButton from "@/src/shared/components/button/CButton";
import getColor from "@/src/styles/Color";
import { useMyGroups } from "@/src/features/group/containers/group/tabs/useMyGroups";
import { useJoinedGroups } from "@/src/features/group/containers/group/tabs/useJoinedGroups";
import { useExplore } from "@/src/features/group/containers/group/tabs/useExplore";
import { StackNavigationProp } from "@react-navigation/stack";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";
const Color = getColor();

interface SearchGroupProps {
  textSearch: string;
  userId: string;
  navigation: StackNavigationProp<SearchStackParamList, "Search">;
}


const SearchGroup = ({ textSearch, userId, navigation }: SearchGroupProps) => {
  const { myGroups, loading: myGroupsLoading, error: myGroupsError } = useMyGroups(userId);
  const { savedGroups, loading: joinedGroupsLoading, error: joinedGroupsError } = useJoinedGroups(userId);
  const { groupsNotJoined, loading: exploreLoading, error: exploreError, handleJoinGroup } = useExplore(userId);

  const [visibleMyGroupsCount, setVisibleMyGroupsCount] = useState(3);
  const [visibleJoinedGroupsCount, setVisibleJoinedGroupsCount] = useState(3);
  const [visibleNotJoinedGroupsCount, setVisibleNotJoinedGroupsCount] = useState(3);

  // Chuẩn hóa chuỗi tìm kiếm
  const normalizedSearch = removeVietnameseTones(textSearch);

  // Lọc nhóm theo textSearch
  const filterGroups = (groups: any[]) =>
    groups.filter((group) => {
      if (!group.groupName) return false;
      const normalizedName = removeVietnameseTones(group.groupName);
      // Kiểm tra chứa chuỗi hoặc gần giống
      return normalizedName.includes(normalizedSearch);
    });

  const filteredMyGroups = filterGroups(myGroups);
  const filteredJoinedGroups = filterGroups(savedGroups);
  const filteredNotJoinedGroups = filterGroups(groupsNotJoined);

  // Kết hợp trạng thái loading và error
  const loading = myGroupsLoading || joinedGroupsLoading || exploreLoading;
  const error = [myGroupsError, joinedGroupsError, exploreError].filter((err) => err).join("; ") || null;

  // Hàm xử lý tham gia nhóm đồng bộ
  const onJoinGroup = (groupId: string) => {
    handleJoinGroup(groupId).catch((err) => {
      console.error("Lỗi khi tham gia nhóm:", err);
    });
  };

  // Hàm rỗng cho các trường hợp không cần tham gia
  const noopJoinGroup = (groupId: string) => {
    // Không làm gì
  };

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

  // Kiểm tra nếu không có nhóm nào
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
          {/* Nhóm của tôi */}
          {renderGroupSection(
            filteredMyGroups,
            visibleMyGroupsCount,
            setVisibleMyGroupsCount,
            false
          )}

          {/* Nhóm đã tham gia */}
          {renderGroupSection(
            filteredJoinedGroups,
            visibleJoinedGroupsCount,
            setVisibleJoinedGroupsCount,
            false
          )}

          {/* Nhóm chưa tham gia */}
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

export default SearchGroup;

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