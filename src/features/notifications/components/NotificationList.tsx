import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Notification } from "../interface/INotification";
import NotificationItem from "./NotificationItem";

interface NotificationListProps {
  notifications: Notification[];
  selectedTab: string;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnRead: (id: string) => void;
  onDelete: (id: string) => void;
  handleOptions: (
    onMarkAsRead: () => void,
    onMarkAsUnread: () => void,
    onDelete: () => void
  ) => void;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
  loadMoreNotifications: () => void;
  isLoadingMore: boolean;
  loading?: boolean;
}
const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  selectedTab,
  onMarkAsRead,
  onMarkAsUnRead,
  onDelete,
  handleOptions,
  handleScroll,
  loadMoreNotifications,
  isLoadingMore,
  loading = false,
}) => {
  useTheme();
  const filteredNotifications = notifications.filter((notification) => {
    if (selectedTab === "Tất cả") return true;
    if (selectedTab === "Đã đọc") return notification.status === "read";
    if (selectedTab === "Chưa đọc") return notification.status === "unread";
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={[styles.loadingText, { color: Color.textColor1 }]}>
          Đang tải thông báo...
        </Text>
      </View>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <View style={styles.noNotifications}>
        <Text style={[styles.noNotificationsText, { color: Color.textColor1 }]}>
          Không có thông báo
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredNotifications}
      onScroll={handleScroll}
      keyExtractor={(item, index) => (item._id ? item._id : `notification-${index}`)}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onMarkAsRead={() => onMarkAsRead(item._id)}
          onMarkAsUnRead={() => onMarkAsUnRead(item._id)}
          onDelete={() => onDelete(item._id)}
          handleOptions={handleOptions}
        />
      )}
      style={styles.listContainer}
      onEndReached={loadMoreNotifications}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="large" color={Color.mainColor2} />
            <Text style={[styles.loadingText, { color: Color.textColor1 }]}>
              Đang tải thêm...
            </Text>
          </View>
        ) : null
      }
    />
  );
};

export default NotificationList;

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  noNotifications: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noNotificationsText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  footerLoading: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
});