// PageScreen.tsx
import TabBarCustom from "@/src/features/group/components/TabBarCustom";
import PostDialog from "@/src/features/newfeeds/components/PostDialog/PostDialog";
import usePostDialog from "@/src/features/newfeeds/components/PostDialog/usePostDialog";
import BubbleButton from "@/src/shared/components/bubblebutton/BubbleButton";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import PageHeader from "../../components/PageHeader";
import LocationInfo from "./tabs/LocationInfo";
import PageHome from "./tabs/PageHome";
import PageInvitations from "./tabs/PageInvitations";
import PageMembers from "./tabs/PageMembers";
import PageTickets from "./tabs/PageTickets";
import usePageScreen from "./usePageScreen";

interface PageScreenProps {
  route: RouteProp<PageStackParamList, "PageScreen">;
}

const PageScreen: React.FC<PageScreenProps> = ({ route }) => {
  useTheme();
  const navigation = useNavigation<NavigationProp<ExploreStackParamList>>();
  const pageId = route.params?.pageId;

  const {
    page,
    role,
    loading,
    error,
    selectedTab,
    setSelectedTab,
    filteredTabs,
    fetchPage,
    avatar,
    address,
    modalVisible,
    setModalVisible,
    handleMorePress,
    pendingInvites,
    acceptAdminInvite,
    declineAdminInvite,
    getUserId,
    currentUserId,
    handlePressMessage
  } = usePageScreen(pageId, navigation);

    useEffect(() => {
      getUserId();
  }, []);

  const {
    isModalVisible: isPostDialogVisible,
    postContent,
    setPostContent,
    toggleModal: togglePostDialog,
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
    isLoading,
    location,
    getCurrentLocation,
    handleMapPointSelect,
    clearLocation,
    openMapPicker,
    isLocationLoading,
    setPageID,
    setGroupID,
    MapPickerDialog,
    isMapPickerVisible,
    setMapPickerVisible,
  } = usePostDialog(currentUserId || "");

  useEffect(() => {
    setPageID(pageId);
  }, [pageId, setPageID]);

  const { tabbarPosition, handleScroll } = useScrollTabbar();

  if (!pageId) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={{ color: Color.error }}>Lỗi: Không tìm thấy pageId</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={{ color: Color.textSecondary }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error || !page) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={{ color: Color.error }}>Lỗi: {error || "Không tìm thấy trang"}</Text>
      </View>
    );
  }

  const renderContent = () => {
    switch (selectedTab) {
      case "Trang chủ":
        return (
          <LocationInfo
            page={page}
            currentUserId={currentUserId || ""}
            role={role}
            onMessagePress={handlePressMessage}
          />
        );
      case "Bài viết":
        return <PageHome page={page} currentUserId={currentUserId || ""} role={role} />;
      case "Quản lý lời mời":
        return (
          <PageInvitations
            page={page}
            currentUserId={currentUserId || ""}
            role={role}
            updatePage={fetchPage}
          />
        );
      case "Quản trị viên":
        return (
          <PageMembers
            page={page}
            currentUserId={currentUserId || ""}
            role={role}
            updatePage={fetchPage}
          />
        );
      case "Dịch vụ":
        return <PageTickets page={page} currentUserId={currentUserId || ""} role={role} updatePage={fetchPage} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <FlatList
        data={[{ key: "content" }]}
        renderItem={() => (
          <>
            <View style={[styles.headerContainer, { backgroundColor: Color.background }]}>
              <PageHeader
                page={page}
                currentUserId={currentUserId || ""}
                role={role}
                updatePage={fetchPage}
                avatar={avatar}
                address={address}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                handleMorePress={handleMorePress}
                pendingInvites={pendingInvites}
                acceptAdminInvite={acceptAdminInvite}
                declineAdminInvite={declineAdminInvite}
              />
            </View>
            <View style={styles.tabBarContainer}>
              <TabBarCustom
                tabs={filteredTabs}
                selectedTab={selectedTab}
                onSelectTab={setSelectedTab}
              />
            </View>
            {renderContent()}
          </>
        )}
        keyExtractor={(item) => item.key}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      />
      <CTabbar tabbarPosition={tabbarPosition} />

      {(role === "isOwner" || role === "isAdmin") && (
        <BubbleButton onPress={togglePostDialog} />
      )}

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

export default PageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabBarContainer: {
    marginTop: 380,
    zIndex: 9,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});