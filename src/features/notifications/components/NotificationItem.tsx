import { NotificationParamList } from "@/src/shared/routes/NotificationNavigation";
import getColor from "@/src/styles/Color";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For fetching currentUserId
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Notification } from "../interface/INotification";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onMarkAsUnRead: () => void;
  onDelete: () => void;
  handleOptions: (onMarkAsRead: () => void, onMarkAsUnread: () => void, onDelete: () => void) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnRead,
  onDelete,
  handleOptions,
}) => {
  const colors = getColor();
  const navigation = useNavigation<NativeStackNavigationProp<NotificationParamList>>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch currentUserId from AsyncStorage
  const fetchCurrentUserId = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchCurrentUserId();
  }, [fetchCurrentUserId]);

  const handlePress = async () => {
    // Mark notification as read if unread
    if (notification.status === "unread") {
      onMarkAsRead();
    }

    // Navigate based on relatedEntityType
    switch (notification.relatedEntityType) {
      case "Article":
        if (notification.articleId) {
          navigation.navigate("NewFeedNavigation", {
            screen: "ArticleDetail",
            params: { articleId: notification.articleId },
          });
        } else {
          Alert.alert("Lỗi", "Không tìm thấy bài viết liên quan.");
        }
        break;

      case "Comment":
        if (notification.articleId && notification.commentId) {
          navigation.navigate("NewFeedNavigation", {
            screen: "ArticleDetail",
            params: { articleId: notification.articleId, commentId: notification.commentId },
          });
        } else {
          Alert.alert("Lỗi", "Không tìm thấy bình luận hoặc bài viết liên quan.");
        }
        break;

      case "Group":
        if (notification.groupId) {
          if (!currentUserId) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập để xem nhóm.");
            return;
          }
          navigation.navigate("GroupNavigaton", {
            screen: "GroupDetailsScreen",
            params: { groupId: notification.groupId, currentUserId },
          });
        } else {
          Alert.alert("Lỗi", "Không tìm thấy nhóm liên quan.");
        }
        break;

      case "Page":
        if (notification.pageId) {
          if (!currentUserId) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập để xem trang.");
            return;
          }
          navigation.navigate("PageNavigation", {
            screen: "PageScreen",
            params: { pageId: notification.pageId, currentUserId },
          });
        } else {
          Alert.alert("Lỗi", "Không tìm thấy trang liên quan.");
        }
        break;

      case "Reel": 
        if (notification.reelId) {
          navigation.navigate("ReelNavigation", {
            screen: "ReelDetail", 
            params: { reelId: notification.reelId }, 
          });
        } else {
          Alert.alert("Lỗi", "Không tìm thấy Reel liên quan.");
        }
        break;

      default:
        Alert.alert("Thông báo", "Không thể điều hướng đến nội dung này.");
    }
  };

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    handleOptions(onMarkAsRead, onMarkAsUnRead, onDelete);
  };

  return (
    <View style={styles.notificationItemContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.notificationItem}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        <Image
          source={{
            uri:
              notification?.senderId?.avt?.length > 0
                ? notification.senderId.avt[notification.senderId.avt.length - 1].url
                : "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png",
          }}
          style={styles.avatar}
        />
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationMessage, { color: colors.textColor1 }]}>
            <Text style={[styles.boldText, { color: colors.textColor1 }]}>
              {notification?.senderId?.displayName || "Người dùng ẩn danh"}
            </Text>{" "}
            {notification?.message || "Không có nội dung"}
          </Text>
          <Text style={styles.notificationTime}>
            {notification?.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : "Không rõ thời gian"}
          </Text>
        </View>
        {notification?.status === "unread" && (
          <View style={[styles.unreadDot, { backgroundColor: colors.mainColor2 }]} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  notificationItemContainer: {
    position: "relative",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: getColor().borderColor1,
    backgroundColor: getColor().backGround, // Fixed from backGround
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
    color: getColor().borderColor1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
});