import React from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import NotificationItem from "./NotificationItem";
import { Notification } from "../interface/INotification";
import getColor from "@/src/styles/Color";

interface NotificationListProps {
  notifications: Notification[];
  selectedTab: string;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnRead: (id: string) => void;
  onDelete: (id: string) => void;
  handleOptions: (onMarkAsRead: () => void, onMarkAsUnread: () => void, onDelete: () => void) => void;
  handleScroll: (event: {
    nativeEvent: {
        contentOffset: {
            y: any;
        };
    };
  }) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  selectedTab,
  onMarkAsRead,
  onMarkAsUnRead,
  onDelete,
  handleOptions,
  handleScroll
}) => {
  const colors = getColor();

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedTab === "Tất cả") return true;
    if (selectedTab === "Đã đọc") return notification.status === "read";
    if (selectedTab === "Chưa đọc") return notification.status === "unread";
  });

  if (filteredNotifications.length === 0) {
    return (
      <View style={styles.noNotifications}>
        <Text style={[styles.noNotificationsText, { color: colors.textColor1 }]}>
          Không có thông báo
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredNotifications}
      onScroll={handleScroll}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator = {false}
      renderItem={({ item }) => {
      
        return (
          <NotificationItem
          avatar={
            item?.senderId?.avt?.length > 0 
              ? item.senderId.avt[item.senderId.avt.length - 1].url 
              : "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png"
          }
            name={item?.senderId?.displayName || "Người dùng ẩn danh"} 
            message={item?.message || "Không có nội dung"}
            time={item?.createdAt ? new Date(item.createdAt).toLocaleString() : "Không rõ thời gian"}
            isUnread={item?.status === "unread"}
            onMarkAsRead={() => onMarkAsRead(item._id)}
            onMarkAsUnRead={() => onMarkAsUnRead(item._id)}
            onDelete={() => onDelete(item._id)}
            handleOptions={handleOptions}
          />
        );
      }}
      style={styles.listContainer}
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
});
