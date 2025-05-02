import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import TabBarCustom from "@/src/features/group/components/TabBarCustom";
import GroupHome from "@/src/features/group/containers/detail-group/tabs/GroupHome";
import GroupRules from "@/src/features/group/containers/detail-group/tabs/GroupRules";
import GroupJoinRequests from "@/src/features/group/containers/detail-group/tabs/GroupJoinRequests";
import GroupPostApproval from "@/src/features/group/containers/detail-group/tabs/GroupPostApproval";
import GroupMySelf from "@/src/features/group/containers/detail-group/tabs/GroupMySelf";
import GroupMembers from "@/src/features/group/containers/detail-group/tabs/GroupMembers";
import GroupHeader from "@/src/features/group/components/GroupHeader";
import getColor from "@/src/styles/Color";
import InviteFriendsModal from "../../components/InviteFriendsModal";
import EditGroupScreen from "../../components/EditGroupScreen";
import GroupTopBar from "../../components/GroupTopBar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { RouteProp } from "@react-navigation/native";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import PostDialog from "@/src/features/newfeeds/components/PostDialog/PostDialog";
import { useGroupDetailsScreen } from "./useGroupDetailsScreen";

const Color = getColor();

interface GroupDetailsScreenProps {
  route: RouteProp<GroupParamList, "GroupDetailsScreen">;
}

const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({ route }) => {
  const { groupId, currentUserId } = route.params;
  const {
    selectedTab,
    setSelectedTab,
    inviteModalVisible,
    setInviteModalVisible,
    isEditingGroup,
    setIsEditingGroup,
    groupState,
    setGroupState,
    groupData,
    userRole,
    handleEditGroup,
    handleInvite,
    handleSaveGroup,
    deleteGroup,
    isPostDialogVisible,
    postContent,
    setPostContent,
    togglePostDialog,
    handlePost,
    privacy,
    setPrivacy,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    selectedImages,
    hashtags,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    hashtagInput,
    handleRoleUpdate,
    isLoading,
    location,
    getCurrentLocation,
    handleMapPointSelect,
    clearLocation,
    isLocationLoading,
    MapPickerDialog, 
    isMapPickerVisible,
    setMapPickerVisible, 
    setPageID,
    openMapPicker
  } = useGroupDetailsScreen(groupId, currentUserId);

  const { tabbarPosition, handleScroll } = useScrollTabbar();

  const allTabs = [
    { label: "Trang chủ", icon: "home", roles: ["Guest", "Member", "Admin", "Owner"] },
    { label: "Quy định", icon: "rule", roles: ["Guest", "Member", "Admin", "Owner"] },
    { label: "Thành viên", icon: "people", roles: ["Guest", "Member", "Admin", "Owner"] },
    { label: "Yêu cầu", icon: "person-add", roles: ["Admin", "Owner"] },
    { label: "Duyệt bài", icon: "check-circle", roles: ["Admin", "Owner"] },
    { label: "Bạn", icon: "group", roles: ["Member", "Admin", "Owner"] },
  ];

  const filteredTabs = allTabs.filter(tab => tab.roles.includes(userRole));

  if (!groupState) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Trang chủ":
        return <GroupHome groupId={groupId} currentUserId={currentUserId} role={userRole} />;
      case "Quy định":
        return <GroupRules groupId={groupId} currentUserId={currentUserId} role={userRole} />;
      case "Yêu cầu":
        return <GroupJoinRequests groupId={groupId} currentUserId={currentUserId} role={userRole} />;
      case "Duyệt bài":
        return <GroupPostApproval groupId={groupId} currentUserId={currentUserId} role={userRole} />;
      case "Thành viên":
        return <GroupMembers groupId={groupId} currentUserId={currentUserId} role={userRole} />;
      case "Bạn":
        return <GroupMySelf groupId={groupId} currentUserId={currentUserId} role={userRole} onRoleUpdated={handleRoleUpdate} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {isEditingGroup ? (
        <EditGroupScreen group={groupState} onCancel={() => setIsEditingGroup(false)} onSave={handleSaveGroup} />
      ) : (
        <>
          <View style={styles.fixedTopBar}>
            <GroupTopBar
              groupId={groupId}
              groupName={groupState?.groupName || ""}
              groupAvatar={groupState?.avt?.url || ""}
              role={userRole}
              onEditGroup={handleEditGroup}
              onDeleteGroup={deleteGroup}
            />
          </View>

          <FlatList
            style={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            data={[1]}
            renderItem={() => (
              <>
                <GroupHeader
                  group={groupState}
                  role={userRole}
                  onInvite={handleInvite}
                />

                <InviteFriendsModal
                  groupId={groupId}
                  userId={currentUserId}
                  groupName={groupState?.groupName || ""}
                  visible={inviteModalVisible}
                  onClose={() => setInviteModalVisible(false)}
                  onInvite={(selectedUsers) => console.log("Mời", selectedUsers)}
                />

                <TabBarCustom
                  tabs={filteredTabs}
                  selectedTab={selectedTab}
                  onSelectTab={setSelectedTab}
                  style={styles.tabBarStyle}
                  activeTabStyle={styles.activeTabStyle}
                  inactiveTabStyle={styles.inactiveTabStyle}
                  activeTextStyle={styles.activeTextStyle}
                  inactiveTextStyle={styles.inactiveTextStyle}
                />

                {renderTabContent()}
              </>
            )}
          />
        </>
      )}
      {userRole !== "Guest" && <BubbleButton onPress={togglePostDialog} />}

      <PostDialog
        isModalVisible={isPostDialogVisible}
        postContent={postContent}
        setPostContent={setPostContent}
        toggleModal={togglePostDialog}
        handlePost={handlePost}
        privacy={privacy}
        setPrivacy={setPrivacy}
        handlePickImage={handlePickImage}
        handleTakePhoto={handleTakePhoto}
        handleRemoveImage={handleRemoveImage}
        selectedImages={selectedImages.map((media) => media.uri)}
        hashtags={hashtags}
        setHashtagInput={setHashtagInput}
        handleAddHashtag={handleAddHashtag}
        handleRemoveHashtag={handleRemoveHashtag}
        hashtagInput={hashtagInput}
        isLoading={isLoading}
        location={location}
        handleMapPointSelect={handleMapPointSelect}
        getCurrentLocation={getCurrentLocation}
        clearLocation={clearLocation}
        isLocationLoading={isLocationLoading}
        MapPickerDialog = {MapPickerDialog}
        isMapPickerVisible = {isMapPickerVisible}
        openMapPicker = {openMapPicker}
        setMapPickerVisible = {setMapPickerVisible}
      />
    </View>
  );
};

export default GroupDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.backGround },
  fixedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Color.mainColor1,
  },
  tabBarStyle: { marginHorizontal: 15, marginTop: 10, marginBottom: 20 },
  activeTabStyle: { backgroundColor: Color.mainColor1 },
  inactiveTabStyle: { backgroundColor: "transparent" },
  activeTextStyle: { color: "#fff", fontWeight: "bold" },
  inactiveTextStyle: { color: Color.textColor3 },
  content: { flex: 1, marginTop: 90, paddingBottom: 20 },
});