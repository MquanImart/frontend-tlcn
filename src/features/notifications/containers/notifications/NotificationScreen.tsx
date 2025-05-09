import CHeader from "@/src/shared/components/header/CHeader";
import TabbarTop from "@/src/shared/components/tabbar-top/TabbarTop";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import getColor from "@/src/styles/Color";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import NotificationList from "../../components/NotificationList";
import useNotificationScreen from "./useNotificationScreen";

const SWIPE_THRESHOLD = 50;

const NotificationScreen: React.FC = () => {
  const {
    notifications,
    selectedTab,
    setSelectedTab,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleDelete,
    unreadCount,
    handleSwipe,
    handleOptions,
    getUserId,
    loadMoreNotifications,
    isLoadingMore,
  } = useNotificationScreen();

  const { tabbarPosition, handleScroll } = useScrollTabbar();
  const colors = getColor();

  const tabs = [
    { label: "Tất cả" },
    { label: "Chưa đọc" },
    { label: "Đã đọc" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={(e) => {
          const { translationX } = e.nativeEvent;
          if (translationX > SWIPE_THRESHOLD) {
            handleSwipe("right");
          } else if (translationX < -SWIPE_THRESHOLD) {
            handleSwipe("left");
          }
        }}
      >
        <View style={[styles.container, { backgroundColor: colors.backGround }]}>
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
          />
          <CTabbar tabbarPosition={tabbarPosition} startTab="notifications" />
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});