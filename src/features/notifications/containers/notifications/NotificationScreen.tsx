import CHeader from "@/src/shared/components/header/CHeader";
import TabbarTop from "@/src/shared/components/tabbar-top/TabbarTop";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import getColor from "@/src/styles/Color";
import React from "react";
import { StyleSheet, View } from "react-native";
import NotificationList from "../../components/NotificationList";
import useNotificationScreen from "./useNotificationScreen";

const NotificationScreen: React.FC = () => {
  const {
    notifications,
    selectedTab,
    setSelectedTab,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleDelete,
    handleOptions,
    unreadCount,
    getUserId,
    loadMoreNotifications,
    isLoadingMore,
    loading,
  } = useNotificationScreen();

  const { tabbarPosition, handleScroll } = useScrollTabbar();
  const Color = getColor();

  const tabs = [
    { label: "Tất cả" },
    { label: "Chưa đọc" },
    { label: "Đã đọc" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Color.backGround }]}>
      <CHeader label="Thông báo" showBackButton={false} />
      <TabbarTop tabs={tabs} startTab={selectedTab} setTab={setSelectedTab} />
      <NotificationList
        notifications={notifications}
        selectedTab={selectedTab}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnRead={handleMarkAsUnread}
        onDelete={handleDelete}
        handleOptions={handleOptions}
        handleScroll={handleScroll}
        loadMoreNotifications={loadMoreNotifications}
        isLoadingMore={isLoadingMore}
        loading={loading}
      />
      <CTabbar tabbarPosition={tabbarPosition} startTab="notifications" />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});