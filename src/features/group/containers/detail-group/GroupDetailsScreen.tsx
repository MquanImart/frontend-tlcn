// src/features/group/containers/detail-group/GroupDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, FlatList, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import TabBarCustom from "@/src/features/group/components/TabBarCustom";
import GroupHome from "@/src/features/group/containers/detail-group/tabs/GroupHome";
import GroupRules from "@/src/features/group/containers/detail-group/tabs/GroupRules";
import GroupJoinRequests from "@/src/features/group/containers/detail-group/tabs/GroupJoinRequests";
import GroupPostApproval from "@/src/features/group/containers/detail-group/tabs/GroupPostApproval";
import GroupMySelf from "@/src/features/group/containers/detail-group/tabs/GroupMySelf";
import GroupMembers from "@/src/features/group/containers/detail-group/tabs/GroupMembers";
import GroupHeader from "@/src/features/group/components/GroupHeader";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo Color có thuộc tính 'white' hoặc dùng 'white' trực tiếp
import InviteFriendsModal from "../../components/InviteFriendsModal";
import EditGroupScreen from "../../components/EditGroupScreen";
import GroupTopBar from "../../components/GroupTopBar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { RouteProp } from "@react-navigation/native";
import { GroupParamList } from "@/src/shared/routes/GroupNavigation";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import PostDialog from "@/src/features/newfeeds/components/PostDialog/PostDialog";
import { useGroupDetailsScreen } from "./useGroupDetailsScreen";
import InviteAdminModal from "../../components/InviteAdminModal";
import { useGroupMySelf } from "./tabs/useGroupMySelf";
import GroupInvitedAdmins from "./tabs/GroupInvitedAdmins";

const { width: screenWidth } = Dimensions.get('window');

interface GroupDetailsScreenProps {
  route: RouteProp<GroupParamList, "GroupDetailsScreen">;
}

const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({ route }) => {
  useTheme();
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
    openMapPicker,
    currentUserJoinDate
  } = useGroupDetailsScreen(groupId, currentUserId);

  const {
    adminInvite,
    modalVisible: isInviteModalVisible,
    setModalVisible: setInviteModalVisibility,
    handleAcceptInvite,
    handleRejectInvite,
  } = useGroupMySelf(groupId, currentUserId);

  const { tabbarPosition, handleScroll } = useScrollTabbar();

  const allTabs = [
    { label: "Trang chủ", icon: "home", roles: ["Guest", "Member", "Admin", "Owner"] },
    { label: "Quy định", icon: "gavel", roles: ["Guest", "Member", "Admin", "Owner"] },
    { label: "Thành viên", icon: "people", roles: ["Guest", "Member", "Admin", "Owner"] },
    { label: "Yêu cầu", icon: "person-add", roles: ["Admin", "Owner"] },
    { label: "Duyệt bài", icon: "check-circle", roles: ["Admin", "Owner"] },
    { label: "Bạn", icon: "person", roles: ["Member", "Admin", "Owner"] },
    { label: "Lời mời admin", icon: "send", roles: ["Owner"] },
  ];

  const filteredTabs = allTabs.filter(tab => tab.roles.includes(userRole));

  const handleAcceptInviteWithRoleUpdate = async () => {
    await handleAcceptInvite();
    handleRoleUpdate();
  };

  const handleRejectInviteWithRoleUpdate = async () => {
    await handleRejectInvite();
    handleRoleUpdate();
  };

  if (!groupState || !userRole) {
    return (
      <View style={[styles.container, {backgroundColor: Color.background, justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={{color: Color.textPrimary, marginTop: 10}}>Đang tải dữ liệu nhóm...</Text>
      </View>
    );
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
      case "Lời mời admin":
        return <GroupInvitedAdmins groupId={groupId} currentUserId={currentUserId} role={userRole} />;
      case "Bạn":
        return <GroupMySelf groupId={groupId} currentUserId={currentUserId} currentUserJoinDate={currentUserJoinDate ?? 0} role={userRole} groupName= {groupState.groupName}onRoleUpdated={handleRoleUpdate} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: Color.background}]}>
      {isEditingGroup ? (
        <EditGroupScreen group={groupState} onCancel={() => setIsEditingGroup(false)} onSave={handleSaveGroup} />
      ) : (
        <>
          <View style={[styles.fixedTopBar, { backgroundColor: Color.mainColor2 }]}>
            <GroupTopBar
              groupId={groupId}
              groupName={groupState?.groupName || ""}
              groupAvatar={groupState?.avt?.url || ""}
              role={userRole}
              currentUserId={currentUserId}
              onEditGroup={handleEditGroup}
              onDeleteGroup={deleteGroup}
              hasAdminInvite={!!adminInvite?.hasInvite}
              adminInviteData={adminInvite}
              onShowAdminInviteModal={() => setInviteModalVisibility(true)}
              onAcceptAdminInvite={handleAcceptInviteWithRoleUpdate}
              onRejectAdminInvite={handleRejectInviteWithRoleUpdate}
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

                {adminInvite && isInviteModalVisible && (
                  <InviteAdminModal
                    visible={isInviteModalVisible}
                    onClose={() => setInviteModalVisibility(false)}
                    onAccept={handleAcceptInviteWithRoleUpdate}
                    onReject={handleRejectInviteWithRoleUpdate}
                    groupName={adminInvite.groupName}
                    inviterName={adminInvite.inviterName}
                    inviteDate={new Date(adminInvite.inviteDate).toLocaleDateString("vi-VN")}
                    inviterAvatar={adminInvite.inviterAvatar}
                  />
                )}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  // background trắng cho ScrollView (thanh bao quanh tab)
                  style={[styles.tabBarStyle, { backgroundColor: 'white' }]}
                  // contentContainerStyle để cho phép TabBarCustom giãn nở
                  contentContainerStyle={styles.tabBarScrollViewContent}
                >
                  <TabBarCustom
                    tabs={filteredTabs}
                    selectedTab={selectedTab}
                    onSelectTab={setSelectedTab}
                    style={{ backgroundColor: 'transparent' }} 
                    activeTabStyle={{ backgroundColor: Color.mainColor2 }}
                    inactiveTabStyle={{ backgroundColor: 'transparent' }}
                    activeTextStyle={{ color: Color.textOnMain2, fontWeight: 'bold' }}
                    inactiveTextStyle={{ color: Color.textSecondary }}
                  />
                </ScrollView>

                {renderTabContent()}
              </>
            )}
            keyExtractor={(item, index) => String(index)}
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
  container: {
    flex: 1,
  },
  fixedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabBarStyle: {
    marginHorizontal: 15, 
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  tabBarScrollViewContent: {
    flexGrow: 1, 
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: 90,
    paddingBottom: 20,
  },
});